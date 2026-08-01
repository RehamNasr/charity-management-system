# Charity Management System — Software Architecture & SRS

Status: **Draft for approval — no code generated yet**
Owner: mohammedredaselim1@gmail.com
Date: 2026-08-01
Revision: v2 — incorporates state-management change (Firestore + Zustand, TanStack Query removed), Notifications,
Activity Feed, Search normalization, Lookup collections, Attachments collection, Storage structure, Soft Delete,
Reminders, Field History tracking, Dashboard analytics expansion, configurable financial-officer permissions,
and a final CTO-level architecture review (§13).

---

## 1. Purpose & Scope

A centralized, web-based (PWA, RTL/Arabic-first) system for a non-profit organization to manage beneficiary
("case") records, social research visits, in-kind and cash assistance, donors, donations, expenses, and
financial/statistical reporting, with full auditability and role-based access control.

**Assumption stated explicitly (please confirm or correct):** "production for thousands of users" most likely
means *thousands of beneficiary case records and transactions over time*, not thousands of concurrent
back-office staff. Charity back-office systems typically have tens to low-hundreds of internal users
(social workers, financial officers, admins). The architecture below is optimized for **data-volume scale**
(tens of thousands of cases/transactions/documents) and **read-heavy dashboards**, which is the actual
scaling challenge in this domain. If you *do* expect thousands of concurrent internal users, flag it — it
changes nothing structurally but affects Firestore quota/cost planning.

---

## 2. Non-Functional Requirements

| Requirement | Decision | Rationale |
|---|---|---|
| Language/Direction | Arabic primary, RTL, i18n-ready structure | MUI has first-class RTL support (stylis-plugin-rtl + emotion cache); building the i18n layer now costs almost nothing and avoids a rewrite if English is added later |
| Platform | Responsive PWA (installable, offline shell) | Field researchers may have poor connectivity during visits; PWA gives an installable app-like experience without native app store overhead |
| Availability | Firebase Hosting + Firestore (managed, multi-region) | No infra to operate; SLA-backed by Google |
| Security | RBAC via Firebase custom claims, Firestore Security Rules, server-side validation for financial writes | Client-only validation is not trustworthy for money/ledger integrity |
| Auditability | Immutable audit log, written server-side only (Cloud Functions) | Charities are accountable to donors/regulators; every state change on a case, assistance record, or financial transaction must be traceable to a user and timestamp |
| Data integrity (financial) | Server-side ledger with atomic aggregate updates | Firestore has no cross-document ACID guarantees on the client; balance must never be computed by summing thousands of docs client-side, and must never race under concurrent writes |
| Performance | Denormalized read models, pagination, composite indexes | Firestore charges per document read; dashboards must read O(1) summary docs, not O(n) collections |
| Backup/DR | Scheduled Firestore export to Cloud Storage (Cloud Scheduler + Functions) | Beneficiary/financial data loss is unacceptable for an audited non-profit |
| Accessibility | WCAG AA target, MUI defaults + audits | Public-sector-adjacent software should be accessible |
| Sensitive data | National ID, income, address are PII | Masked in UI for lower-privilege roles; Firestore Rules restrict field-level read only via document-shape splitting where needed (see §6). **Which roles see which sensitive fields (e.g. address) is configurable per-role, not hardcoded** — see §3 and §12 |
| Data retention | Soft delete on every major collection (`isDeleted`, `deletedAt`, `deletedBy`) | Charities are subject to audit/legal retention requirements; hard deletes destroy evidence. Deleted records are excluded from all normal queries but remain recoverable/auditable — see §6.8 |

---

## 3. User Roles & Permissions (RBAC)

Roles are a **fixed enum enforced via Firebase custom claims** (not a client-editable Firestore field), and
mirrored into a `users` document for UI display only. Custom claims are the enterprise-standard approach
because Security Rules can trust `request.auth.token.role` without an extra document read, and because a
malicious/compromised client cannot edit its own claim (unlike a plain Firestore field, which — even with
rules — invites subtle bugs if a rule ever forgets to lock down the `role` field on `update`).

| Role | Description | Key permissions |
|---|---|---|
| **super_admin** | System owner (org's IT/founder) | Full access; manage users & roles; manage lookups/settings; view audit log |
| **admin** (org manager) | Day-to-day organizational lead | Full access to cases, assistance, donors, financial, reports; cannot manage other admins' roles |
| **social_researcher** (الباحث الاجتماعي) | Field researcher | Create/edit assigned cases, family members, visits, upload documents; **no financial access**; cannot delete cases |
| **case_reviewer** (مراجع/معتمد الحالات) | Approves case status/priority changes and assistance requests | Read all cases; approve/reject status transitions and assistance disbursement; cannot edit raw case data |
| **financial_officer** | Manages money | Full CRUD on donors, donations, expenses; approve/disburse assistance financial side; read-only on case personal data. Visibility of specific PII fields (address, national ID, income) is **configurable per organization** via role permissions — see below |
| **data_entry** | Limited clerical role | Create/edit cases in draft state only; no delete; no status transitions; no financial access |
| **auditor** (مدقق/عضو مجلس إدارة) | External or board reviewer | Read-only across the entire system, including audit log and financial reports; no writes anywhere |

Permission matrix and the state machine for case/assistance approval workflows are detailed in §5 and §8.

**Design rule:** every role that can *write* financial or case-approval data is distinct from every role that
can *review/approve* it, wherever practical (segregation of duties) — e.g. a `financial_officer` records a
donation, but only `admin`/`case_reviewer` approves an assistance disbursement against it. This is standard
non-profit financial-controls practice and costs nothing extra to implement now vs. retrofitting later.

### Configurable role permissions (not hardcoded)

Some field-level visibility rules differ by organization — e.g. some organizations require `financial_officer`
to see beneficiary addresses for delivery/logistics purposes, others don't. Instead of hardcoding this in
Security Rules or UI code, it is stored as data:

**`rolePermissions/{role}`** — admin-editable, one document per role
```
role, canViewCaseAddress, canViewNationalId, canViewMonthlyIncome,
canViewPhoneNumbers, canExportReports, canApproveAssistance, ...
updatedBy, updatedAt
```
- Read by Security Rules (via `get()`) at the point of the PII-subcollection access check (§8), and by the
  frontend to drive UI field masking — same source of truth for both layers, so UI and Rules never disagree.
- Editable from `/settings/permissions` (admin/super_admin only), so behavior changes don't require a rules
  redeploy.
- Custom claims still govern *coarse* role membership (unchanged, unforgeable); `rolePermissions` governs
  *fine-grained, org-configurable* field visibility within a role. Keeping these separate means the
  security-critical role assignment stays in claims, while the tunable business policy stays in editable data.

---

## 4. Domain Model / Entities

```
User ──────────────< assignedCases (via researcherId/reviewerId on Case)
Case ──1:N──> FamilyMember (subcollection)
Case ──1:N──> Visit (subcollection)
Case ──1:N──> StatusHistory (subcollection, audit trail)
Case ──1:N──> FieldHistory (subcollection, tracked-field change history — see §6.7)
Case ──1:N──> Assistance (top-level collection, caseId FK)
Case ──1:N──> Reminder (top-level collection, caseId FK)
Case, Assistance, Donation, Expense, User, Visit ──1:N──> Attachment (top-level collection, ownerCollection+ownerId FK)
Donor ──1:N──> Donation (top-level collection, donorId FK)
Donation ──0:1──> Assistance (optional funding-source link)
Donation, Expense, Assistance ──> Transaction (immutable ledger entry, system-written)
Transaction(s) ──> FinancialSummary (single denormalized aggregate doc)
Every write ──> AuditLog (system-written, Cloud Functions only) ──> ActivityFeed (dashboard view over AuditLog)
Important actions ──> Notification (per-user, system or Cloud-Function generated)
Reminder (due) ──> Notification (generated by scheduled Cloud Function)
```

---

## 5. Case Lifecycle (State Machine)

```
draft → under_research → pending_review → approved → receiving_assistance ⇄ suspended
                                        ↘ rejected                        → closed
```

| State | Meaning | Who can transition |
|---|---|---|
| `draft` | Just created, incomplete | data_entry, social_researcher |
| `under_research` | Social research visit(s) in progress | social_researcher |
| `pending_review` | Research complete, awaiting approval | social_researcher → submits |
| `approved` | Reviewer approved; eligible for assistance | case_reviewer / admin |
| `rejected` | Reviewer rejected, reason required | case_reviewer / admin |
| `receiving_assistance` | Actively receiving one or more assistance types | system (auto) on first disbursement |
| `suspended` | Temporarily paused (e.g. re-verification needed) | admin / case_reviewer |
| `closed` | No longer eligible / case ended | admin |

Every transition writes a `statusHistory` entry (actor, from, to, reason, timestamp) — enforced server-side via
a Cloud Function trigger, not left to client discipline.

---

## 6. Firestore Data Model

### Design principles applied
1. **Top-level collections for anything queried across parents** (assistance, donations, expenses, transactions, attachments, notifications, reminders) — Firestore has no JOINs, so cross-cutting reports need flat collections with FK fields, not deep nesting.
2. **Subcollections only for data always fetched in the context of one parent** (a case's family members, visits, status history, field-change history) — cheap to fetch as a set, and `collectionGroup` queries still allow cross-case reporting (e.g. "all visits this month across all cases") when needed.
3. **Denormalize aggressively for read performance**: case documents carry `researcherName`, `totalAssistanceReceived`, `lastAssistanceDate`; donation/assistance docs carry `caseNumber`, `donorName`. Written once at write-time via Cloud Functions triggers, not recomputed on every read. This trades a small amount of write complexity for large read-cost and latency savings — correct trade for a dashboard-heavy app.
4. **Money is never derived by summing collections client-side.** A single `financialSummary/current` document holds running totals, updated **transactionally** inside Cloud Functions using `runTransaction`, whenever a donation/expense/assistance record is finalized. This is the standard Firestore pattern for real-time counters/ledgers and avoids both read-cost blowup and race conditions.
5. **Immutability where it matters**: `transactions` and `auditLogs` are append-only, writable only by Cloud Functions (Admin SDK), never directly by clients — enforced by Security Rules (`allow write: if false`). This makes the ledger tamper-evident, which matters for an audited non-profit.
6. **No client-side search-token arrays.** Instead of a `searchKeywords[]` array (which balloons document size and still only supports prefix-token matching), searchable text fields store a single **normalized value per field** (`normalizedName`, `normalizedNationalId`, `normalizedPhone` — lowercased, trimmed, Arabic-diacritics-stripped where relevant), maintained by a Cloud Functions trigger whenever the source field changes. Firestore's native `>=`/`<=` range queries on a normalized field give the same prefix-search capability as a keyword array, at a fraction of the storage/write cost. Multi-field or fuzzy search (e.g. "search across name OR phone OR national ID in one query") is still out of Firestore's native capability — if that's required, plan a dedicated search index (Algolia/Typesense/Meilisearch, synced via Cloud Functions trigger) as a Phase-2 addition; this is flagged in §14, not built now.
7. **Every major collection supports soft delete**: `isDeleted` (boolean, default `false`), `deletedAt`, `deletedBy`. All standard app queries filter `isDeleted == false`; every affected composite index therefore leads with `isDeleted`. Hard delete is reserved for `super_admin`-only data-purge tooling (for legal/GDPR-style erasure requests), never for normal user-facing "delete" actions.
8. **Lookup values are editable, first-class collections, not an embedded array.** Governorates/cities/villages/case types/assistance types/expense categories are each their own top-level collection so they can be created/edited/deactivated from the admin dashboard without redeploying code, support parent/child relationships (city → governorate, village → city) as real document references, and don't force a full-document rewrite of one giant `settings/lookups` doc every time one value changes (which would also serialize all concurrent lookup edits against each other).
9. **Attachments are a single dedicated collection**, not an array field embedded in the owning document. An array of attachment metadata caps out (Firestore's 1MiB document limit, plus large arrays hurt read cost even when the caller only needs the doc's core fields) and can't be queried independently (e.g. "all attachments uploaded by user X this week"). A flat `attachments` collection keyed by `(ownerCollection, ownerId)` supports unlimited attachments per owner, independent pagination, and cross-cutting queries.

### Collections

**`users/{uid}`**
```
displayName, email, phone, role (enum), isActive,
createdAt, createdBy, lastLoginAt,
isDeleted, deletedAt, deletedBy
```

**`cases/{caseId}`** — `caseId` generated as sequential formatted number (e.g. `CASE-2026-000123`) via a Cloud Function using a Firestore counter document, not client `Date.now()`, to guarantee uniqueness and sequential order under concurrent creates.
```
caseNumber, fullName, nationalId, phoneNumbers[],
address { governorateId, cityId, villageId, details } (FKs into lookup collections, §6.5),
familyMembersCount, monthlyIncome, needReason,
caseType[] (FK into caseTypes lookup collection),
priorityLevel (low|medium|high|critical),
status (enum, see §5), socialResearchStatus,
assignedResearcherId, assignedResearcherName (denorm),
assignedReviewerId,
totalAssistanceReceived (denorm, updated by trigger),
lastAssistanceDate (denorm),
normalizedName, normalizedNationalId, normalizedPhone (lowercased, trigger-maintained — see design principle #6),
isDeleted, deletedAt, deletedBy,
createdBy, createdAt, updatedBy, updatedAt
```
- `cases/{caseId}/familyMembers/{memberId}`: name, relation, birthDate, nationalId?, notes
- `cases/{caseId}/visits/{visitId}`: visitDate, researcherId, researcherName, reportText, recommendation, createdAt *(photos/documents now live in the top-level `attachments` collection, not embedded here — see §6.6)*
- `cases/{caseId}/statusHistory/{entryId}`: fromStatus, toStatus, actorId, reason, timestamp (system-written)
- `cases/{caseId}/fieldHistory/{entryId}`: field, oldValue, newValue, changedBy, changedAt (system-written — see §6.7)

**`assistance/{assistanceId}`**
```
caseId, caseNumber (denorm), type (FK into assistanceTypes lookup collection),
amount, description, status (requested|approved|disbursed|cancelled),
requestedBy, approvedBy, disbursedBy, disbursedAt,
fundingSource (donorId | "general"), linkedTransactionId,
isDeleted, deletedAt, deletedBy, createdAt
```
*(attachments now via the top-level `attachments` collection, `ownerCollection: "assistance"`)*

**`donors/{donorId}`**
```
name, type (individual|organization), phone, email, address,
isAnonymous, totalDonated (denorm, trigger-maintained), notes,
isDeleted, deletedAt, deletedBy, createdAt, createdBy
```

**`donations/{donationId}`**
```
donorId, donorName (denorm), amount, currency, date, paymentMethod,
purpose (general|caseId), receiptNumber, recordedBy, linkedTransactionId,
isDeleted, deletedAt, deletedBy, createdAt
```

**`expenses/{expenseId}`**
```
category (FK into expenseCategories lookup collection),
amount, description, date, vendor, approvedBy, recordedBy,
linkedTransactionId, isDeleted, deletedAt, deletedBy, createdAt
```
*(attachments now via the top-level `attachments` collection, `ownerCollection: "expenses"`)*

**`transactions/{transactionId}`** — append-only ledger, Cloud-Functions-write-only
```
type (donation_in|expense_out|assistance_out|adjustment),
direction (credit|debit), amount, refCollection, refId,
balanceAfter, createdAt, createdBy
```

**`financialSummary/current`** — single doc, Cloud-Functions-write-only
```
currentBalance, totalDonations, totalExpenses, totalAssistanceDisbursed,
beneficiariesThisMonth, casesThisMonth, lastUpdatedAt
```

**`auditLogs/{logId}`** — system-written only. This remains the **source of truth for the Dashboard Activity Feed** (§9) — the feed is a read view over this collection, not a separate store, so there is exactly one place actions are recorded.
```
actorId, actorRole, action (e.g. case_created|visit_added|assistance_approved|donation_recorded|expense_created|user_created),
targetCollection, targetId, targetLabel (denorm, human-readable — e.g. case number or donor name, for feed display without a follow-up read),
summary, timestamp
```

### 6.4 Notifications

**`notifications/{notificationId}`** — created by Cloud Functions (triggers reacting to important writes, e.g. assistance approved, case assigned, reminder due) and occasionally by trusted callable functions; never written directly by clients.
```
id, title, body, type (info|warning|action_required|reminder),
userId (recipient), read (boolean, default false),
createdAt, createdBy (uid or "system"),
relatedCollection, relatedDocumentId (deep-link target)
```
- Dashboard shows unread notifications and a badge count (`where(userId == me, read == false)` — cheap with a composite index, avoids a separate denormalized counter for v1; revisit with a per-user counter doc only if unread-count reads become a hot path at scale).
- One document per (recipient, event) — a broadcast action (e.g. "case created") that should notify N users fans out to N documents, written by the triggering Cloud Function. This is the standard Firestore notification pattern; see §14 for the fan-out cost caveat at large N.
- A scheduled Cloud Function periodically purges/archives notifications older than a retention window (e.g. 90 days) — see §14.

### 6.5 Lookup collections

Each lookup is its own top-level collection, admin-editable from `/settings`, referenced by ID from other documents (never embedded free text), each with `isActive` so values can be retired without deleting history that references them:
```
governorates/{id}      { name, isActive, order }
cities/{id}             { name, governorateId (FK), isActive, order }
villages/{id}           { name, cityId (FK), isActive, order }
caseTypes/{id}          { name, isActive, order }
assistanceTypes/{id}    { name, isActive, order }
expenseCategories/{id}  { name, isActive, order }
```
Small collections (typically tens to low-hundreds of docs each) — fetched in full and cached client-side (Zustand or a shared hook) rather than paginated, refreshed via `onSnapshot` so admin edits propagate live without a reload.

### 6.6 Attachments

**`attachments/{attachmentId}`** — replaces every embedded `attachments[]`/`documents[]`/`photos[]` array across the schema.
```
id, ownerCollection (enum: cases|visits|assistance|donors|expenses|reports|users — allowlisted, see §8),
ownerId, fileName, storagePath, mimeType, size,
thumbnail (Storage path, populated by a Cloud Function image-resize trigger for image mimeTypes),
uploadedBy, uploadedAt
```
Queried by `(ownerCollection, ownerId)` for "all attachments on this record," or by `(uploadedBy, uploadedAt)` for "everything a user has uploaded." Supports unlimited attachments per owner without touching the owning document.

### 6.7 Field-change history

Tracks *value-level* changes to specific sensitive/high-impact fields — distinct from `auditLogs` (which records *actions*, e.g. "case updated") and from `statusHistory` (which is specific to the case state machine). This gives a precise before/after trail for fields that matter for accountability and dispute resolution.

**`cases/{caseId}/fieldHistory/{entryId}`** — system-written only (Cloud Functions trigger on `cases` update), tracking: `monthlyIncome`, `priorityLevel`, `status` (mirrors statusHistory for a unified per-field view), `familyMembersCount`.
```
field, oldValue, newValue, changedBy, changedAt
```
Kept as a subcollection (always read in the context of one case, e.g. an "edit history" tab) rather than a top-level collection, since cross-case field-history reporting is not a stated requirement; revisit as a top-level collection with a `caseId` FK if that changes.

### 6.8 Reminders

**`reminders/{reminderId}`** — lets researchers schedule future visits/follow-ups against a case.
```
caseId, researcherId, date, title, completed (boolean, default false),
createdAt, createdBy
```
A scheduled Cloud Function (daily) queries upcoming/due reminders (`where(date <= today, completed == false, isDeleted == false)`) and writes a `notifications` document for the assigned researcher — see §6.4. Reminders are surfaced on the case detail view and optionally a personal "My Reminders" list.

**`settings/lookups`** is **removed** — superseded by the dedicated lookup collections in §6.5. (Prior draft proposed a single embedded-array document; that doesn't scale to admin-editable, referenceable, hierarchical lookups.)

**`reports/{reportId}`** (async report jobs, for large exports)
```
type, requestedBy, dateRangeFrom, dateRangeTo, filters,
status (pending|processing|done|failed), fileStoragePath, createdAt
```
Small/simple reports render client-side (jsPDF/exceljs). Org-wide annual reports over thousands of rows are generated **server-side** by a Cloud Function and written to Storage, to avoid freezing the browser tab and to keep generation logic auditable/consistent — the report job pattern also lets the UI show progress and lets Admin re-download without regenerating.

**`rolePermissions/{role}`** — see §3 ("Configurable role permissions").

### Composite indexes anticipated
`cases`: `(isDeleted, status, priorityLevel, createdAt)`, `(isDeleted, assignedResearcherId, status)`, `(isDeleted, address.governorateId, status)`, `(normalizedName)`, `(normalizedNationalId)`, `(normalizedPhone)`
`assistance`: `(isDeleted, caseId, createdAt)`, `(isDeleted, status, type, createdAt)`
`donations`: `(isDeleted, donorId, date)`, `(isDeleted, date)` for monthly reports
`collectionGroup('visits')`: `(researcherId, visitDate)` for workload reporting
`notifications`: `(userId, read, createdAt)`
`attachments`: `(ownerCollection, ownerId, uploadedAt)`, `(uploadedBy, uploadedAt)`
`reminders`: `(researcherId, date, completed)`, `(caseId, date)`
`auditLogs` (activity feed): `(timestamp)` — feed is a simple reverse-chronological read, optionally `(action, timestamp)` if the feed later supports filtering by action type

---

## 7. Firebase Storage Structure

Storage paths are organized by owning domain, mirroring the `attachments` collection's `ownerCollection`/`ownerId`
rather than being freeform — every `attachments.storagePath` must fall under the corresponding prefix, which
Storage Rules enforce (see §8).

```
cases/
  {caseId}/
    documents/        # ID cards, eligibility proofs, etc.
    visits/
      {visitId}/       # visit photos
    attachments/        # anything not covered above
donors/
  {donorId}/
expenses/
  {expenseId}/
reports/
  {reportId}/           # generated PDF/Excel exports
users/
  {uid}/                # profile photo, personal document uploads
```

- Every image upload gets a **thumbnail** generated by a Cloud Function Storage trigger (resize on upload,
  written alongside the original, path recorded in `attachments.thumbnail`) — lists/grids render the thumbnail,
  full image loads only on demand. This is the standard pattern to keep list views fast and avoid downloading
  multi-MB originals just to show a preview tile.
- File-size limit (<10MB) and content-type allowlist (`image/*`, `application/pdf`) enforced in Storage Rules,
  not just client-side, to prevent abuse (see §8).
- Uploads go through a client SDK call authenticated as the uploading user (not a public bucket); Storage Rules
  gate writes by the same role checks as the corresponding Firestore `attachments` document.

---

## 8. Security Strategy

### Authentication
- Firebase Auth, **email/password**. No public self-registration — accounts are created by `admin`/`super_admin` via a callable Cloud Function (`createStaffUser`) that also sets the custom claim, so a user and their role are provisioned atomically.
- Role changes go through a callable function (`setUserRole`, admin-only), never a direct Firestore write to `users/{uid}.role` — the mirrored field is for UI display; the **claim is the source of truth Rules check against**.

### Firestore Security Rules — structure
```
function isSignedIn() { return request.auth != null; }
function role() { return request.auth.token.role; }
function hasAnyRole(roles) { return isSignedIn() && role() in roles; }
function notDeleted() { return resource.data.isDeleted == false; }
function rolePerm(key) {
  return get(/databases/$(database)/documents/rolePermissions/$(role())).data[key] == true;
}

match /cases/{caseId} {
  allow read: if hasAnyRole(['super_admin','admin','social_researcher',
                              'case_reviewer','financial_officer','auditor']);
  allow create: if hasAnyRole(['super_admin','admin','social_researcher','data_entry']);
  allow update: if hasAnyRole(['super_admin','admin','case_reviewer']) ||
                   (hasAnyRole(['social_researcher','data_entry']) &&
                    resource.data.assignedResearcherId == request.auth.uid &&
                    resource.data.status in ['draft','under_research']);
  // "delete" from the UI is always a soft delete (update isDeleted/deletedAt/deletedBy);
  // hard delete is restricted separately, see below.
  allow delete: if false;
}

match /transactions/{id}  { allow read: if hasAnyRole([...finance+admin+auditor]); allow write: if false; }
match /auditLogs/{id}     { allow read: if hasAnyRole(['super_admin','admin','auditor']); allow write: if false; }
match /financialSummary/{id} { allow read: if hasAnyRole([...]); allow write: if false; }

match /notifications/{id} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']); // recipient may only toggle read
  allow create, delete: if false; // Cloud Functions only
}

match /attachments/{id} {
  allow read: if hasAnyRole([...role set appropriate to ownerCollection]);
  allow create: if isSignedIn() &&
                   request.resource.data.ownerCollection in
                     ['cases','visits','assistance','donors','expenses','reports','users'] &&
                   request.resource.data.uploadedBy == request.auth.uid;
  allow delete: if hasAnyRole(['super_admin','admin']);
}

match /reminders/{id} {
  allow read, update: if hasAnyRole(['super_admin','admin']) ||
                          resource.data.researcherId == request.auth.uid;
  allow create: if hasAnyRole(['super_admin','admin','social_researcher']);
}

match /governorates/{id}      { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin','admin']); }
match /cities/{id}            { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin','admin']); }
match /villages/{id}          { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin','admin']); }
match /caseTypes/{id}         { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin','admin']); }
match /assistanceTypes/{id}   { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin','admin']); }
match /expenseCategories/{id} { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin','admin']); }
match /rolePermissions/{id}   { allow read: if isSignedIn(); allow write: if hasAnyRole(['super_admin']); }
```
- `financial_officer` cannot see `nationalId`/`monthlyIncome` on `cases` (always private) — since Firestore
  Rules can't redact individual fields, this is enforced by **splitting the case document's sensitive PII into
  a subcollection** (`cases/{caseId}/private/pii`), readable by `social_researcher`, `case_reviewer`, `admin`,
  `super_admin` unconditionally, and by `financial_officer` **only when `rolePerm('canViewCaseAddress')` /
  `rolePerm('canViewNationalId')` is true** for the address/national-ID fields specifically — this is what
  makes §3's "configurable financial-officer permissions" requirement real at the enforcement layer, not just
  in the UI. The `rolePermissions` doc is a single extra `get()` per access check; Firestore rule evaluation
  caches repeated `get()`s to the same path within one rule evaluation, so this doesn't multiply read cost per
  field. This is a deliberate, slightly more complex schema than a flat doc, chosen specifically to satisfy the
  field-level access requirement — Firestore Rules operate at document granularity, so document-splitting plus
  a permissions lookup is the correct/standard workaround rather than trying to fake field redaction
  client-side or hardcode the split at deploy time.
- All writes to `transactions`, `financialSummary`, `auditLogs`, case `statusHistory`, case `fieldHistory`, and
  `notifications` (create/delete) are `allow write: if false` for clients — only Cloud Functions (Admin SDK,
  which bypasses Rules) may write them. This is what makes the ledger and audit trail tamper-evident.
- **Soft delete enforcement**: standard list/query rules additionally require `notDeleted()` (or the query
  itself filters `isDeleted == false`, backed by the composite indexes in §6) so deleted records never surface
  in normal reads. Only `super_admin`, via a separate admin-only "Recycle Bin" screen and a distinct rule path,
  can query with `isDeleted == true` or perform an actual hard delete (data-purge tooling, §6.7 design
  principle #7).
- Storage Rules mirror Firestore role checks on the paths defined in §7, keyed off the matching `attachments`
  document's `ownerCollection`/`ownerId`, plus file-size (<10MB) and content-type allowlist (`image/*`,
  `application/pdf`) validation.

### Server-side enforcement beyond Rules
Rules stop *unauthorized* writes; they don't validate *business logic* (e.g. "assistance amount must be
positive," "can't disburse against a closed case," "balance can't go negative"). Those are enforced in
**Cloud Functions callable/trigger code**, which is the only path allowed to write financial/ledger data. This
two-layer model (Rules for authorization, Functions for validation + atomicity) is the standard enterprise
Firestore pattern.

---

## 9. Dashboard, Notifications & Activity Feed

### Notifications
- Backed by the `notifications` collection (§6.4). The dashboard header shows an unread-count badge
  (`onSnapshot` on `where(userId == me, read == false)`) and a dropdown/panel listing recent notifications,
  each deep-linking to `relatedCollection`/`relatedDocumentId`.
- Notifications are created two ways: (a) Cloud Functions triggers on important writes (e.g. assistance
  approved → notify the requester; case assigned → notify the researcher), and (b) the scheduled reminder-due
  function (§6.8). Clients never write notifications directly.
- Marking as read is a client update restricted by Rules to the `read` field only (§8), so a compromised or
  buggy client can't rewrite notification content.

### Activity Feed
- Shown on the Dashboard as a reverse-chronological list of recent actions: case created, visit added,
  assistance approved, donation recorded, expense created, user created, etc.
- Sourced directly from `auditLogs` (§6.3) — no separate feed collection — filtered to action types relevant
  for a feed (as opposed to every low-level field write) and rendered using the denormalized `targetLabel` so
  the feed doesn't need a follow-up read per item.
- Role-scoped: `financial_officer` sees financial-relevant activity, `social_researcher` sees case/visit
  activity for their assigned cases, `admin`/`super_admin`/`auditor` see everything — same `hasAnyRole` pattern
  as the rest of the app, applied to the `auditLogs` read rule.

### Dashboard analytics widgets
In addition to totals/charts/recent-activity already implied by §2, the dashboard displays:
- **Top Governorates** / **Top Villages** — case count grouped by `address.governorateId`/`villageId`
- **Top Researchers** — case/visit count grouped by `assignedResearcherId`
- **Most Common Assistance Types** — grouped by `assistance.type`
- **Monthly Trend** — cases created / assistance disbursed / donations received per month
- **Cases by Status**, **Cases by Type** — breakdowns for §5's state machine and `caseType`

These are **aggregate reads, not per-document scans** — consistent with §2's "denormalized read models"
principle. Rather than summing raw collections client-side on every dashboard load (expensive and slow at
data-volume scale), a scheduled/triggered Cloud Function maintains rollup documents (e.g.
`dashboardStats/byGovernorate`, `dashboardStats/byMonth`, `dashboardStats/byResearcher`), updated
incrementally on the same writes that already maintain `financialSummary` and case denormalized fields. The
dashboard reads a handful of small documents instead of aggregating over potentially tens of thousands of
case/assistance/donation records on every page load.

---

## 10. UI Sitemap

```
/login
/dashboard                         (role-scoped widgets: totals, charts, activity feed, notifications)
/cases
  /cases/new                       (multi-step wizard: personal info → address/family → need/type → documents)
  /cases/:id                       (tabs: Overview | Family Members | Visits | Attachments | Assistance History | Status History | Field History | Reminders)
  /cases/:id/edit
/visits
  /visits/new?caseId=
  /visits/:id
/assistance
  /assistance/new
  /assistance/:id                  (approval action for case_reviewer/admin)
/reminders                         (personal "My Reminders" list — social_researcher; admin sees all)
/notifications                     (full notifications history beyond the header dropdown)
/donors
  /donors/:id                      (donation history)
  /donors/new
/donations
  /donations/new
/expenses
  /expenses/new
/financial                         (ledger view, current balance — financial_officer/admin/auditor)
/reports                           (report builder → PDF/Excel, sync for small, async job for large)
/users                             (admin/super_admin only)
/settings
  /settings/lookups                (governorates, cities, villages, case types, assistance types, expense categories — admin only)
  /settings/permissions             (rolePermissions editor, e.g. financial_officer address visibility — super_admin only)
/audit-log                         (admin/super_admin/auditor)
/profile
```

Navigation and visible menu items are filtered by role at render time (defense-in-depth UI layer — the real
enforcement is Firestore Rules, this is just UX so users don't see actions they can't perform).

---

## 11. Frontend Architecture

**Stack (as specified):** React 19, TypeScript, Vite, MUI (with RTL plugin), Firebase (Auth/Firestore/Storage/Hosting), PWA (vite-plugin-pwa).

**Additional recommendations and why:**

| Concern | Choice | Why |
|---|---|---|
| Server-state (Firestore reads/writes, realtime sync, offline cache) | **Firestore SDK directly, via custom reusable hooks** — **not** TanStack Query | Firestore already provides realtime listeners (`onSnapshot`), an offline cache, and multi-tab synchronization out of the box. Layering TanStack Query on top means running two overlapping caches (Query's cache and Firestore's own) that can disagree, plus reimplementing invalidation for data that already pushes updates to the client in realtime. A thin, hand-rolled hook layer (`useCaseDoc`, `useCasesQuery`, `useCollection<T>`, etc. — see below) gives the same DX (loading/error states, typed results) with one source of truth instead of two, and no dependency to keep in sync with Firestore's own caching behavior. |
| Client/UI/global app state | **Zustand**, scoped narrowly | Redux is unjustified overhead for this app's state shape. Zustand holds **only** state that is genuinely global and not itself Firestore data: authenticated user (claims/profile), theme, sidebar open/collapsed, global filters (e.g. active governorate/date-range filter shared across dashboard widgets), the currently selected case (for cross-panel context, e.g. a case detail layout with multiple panels reading the same case), and notification UI state (unread count/badge, panel open/closed — the notification *documents* themselves are Firestore data read via a hook, not copied into the store). Everything else — case lists, donation records, financial summaries — stays in Firestore, read live via hooks; duplicating it into Zustand would just recreate the two-caches problem TanStack Query was removed to avoid. |
| Forms | **React Hook Form + Zod** | Cases have long, multi-step forms with nested arrays (family members, phone numbers); RHF minimizes re-renders, Zod gives typed schema validation shared conceptually with the Cloud Functions validation layer |
| Routing | **React Router v6/v7** | Standard for Vite SPA/PWA |
| Charts | **MUI X Charts** (or Recharts) | Native MUI look/RTL consistency for dashboard |
| PDF/Excel (client-side path) | **jsPDF/pdfmake + exceljs** | For small, on-demand reports; large reports go through the server-side `reports` job pattern (§6) |
| RTL | `stylis-plugin-rtl` + emotion cache configured at app root | Required for correct MUI RTL rendering; must be set up in Phase 0, not retrofitted |

### Custom Firestore hooks pattern (replaces TanStack Query)

A small, shared set of generic hooks wraps the Firestore SDK so features don't hand-roll `onSnapshot`
boilerplate:
- `useDocument<T>(path)` / `useCollection<T>(query)` — subscribe via `onSnapshot`, return `{ data, loading,
  error }`, unsubscribe on unmount. Firestore's offline cache means these resolve instantly from cache when
  offline/slow, then reconcile when connectivity returns — no manual "stale-while-revalidate" logic needed.
- `usePaginatedCollection<T>(query, pageSize)` — wraps `startAfter`/cursor pagination for list screens (case
  list, donations, audit log) where a live `onSnapshot` on the whole collection would be wasteful.
- Mutations are plain async functions in each feature's `api/` folder (`createCase()`, `approveAssistance()`)
  that call the Firestore SDK or a callable Cloud Function directly — no mutation-caching wrapper needed, since
  the realtime listener that's already subscribed picks up the result automatically once the write commits (or
  optimistically, via Firestore's own local-write reflection).
- All list-screen queries filter `isDeleted == false` by default at the hook-construction layer (a shared
  `withSoftDeleteFilter(query)` helper), so soft-delete correctness (§6.7) isn't left to each feature to
  remember individually.

### Folder structure
```
src/
  app/                 # App shell, providers, route config
  assets/
  components/          # Shared/dumb UI (buttons, tables, layout)
  features/
    auth/
    dashboard/
    notifications/
    reminders/
    cases/
    visits/
    assistance/
    donors/
    donations/
    expenses/
    financial/
    reports/
    users/
    settings/          # lookups CRUD + rolePermissions editor
    audit/
    <each feature>/
      components/
      hooks/           # useDocument/useCollection-based hooks specific to this feature
      api/             # Firestore query/mutation functions (plain async, no query-cache wrapper)
      schema.ts       # Zod schemas
      types.ts
  hooks/               # Cross-feature shared hooks: useDocument, useCollection, usePaginatedCollection
  lib/                 # firebase.ts (init), rtlCache.ts
  routes/
  store/               # Zustand stores: auth.ts, theme.ts, sidebar.ts, filters.ts, selectedCase.ts, notifications.ts
  theme/               # MUI theme + RTL setup
  types/
  utils/
  i18n/                # Arabic strings now; structure ready for additional locales

functions/             # Separate Cloud Functions package
  src/
    triggers/          # onWrite handlers: financialSummary updates, audit log writes, statusHistory writes,
                        # fieldHistory writes, normalizedName/normalizedNationalId/normalizedPhone maintenance,
                        # notification fan-out, thumbnail generation
    scheduled/          # reminder-due sweep, notification retention purge, dashboardStats rollups
    callable/          # createStaffUser, setUserRole, generateReport, approveAssistance
    utils/

firestore.rules
storage.rules
firestore.indexes.json
```

---

## 12. Implementation Roadmap

| Phase | Scope | Est. |
|---|---|---|
| 0 | Project scaffold (Vite/TS/MUI/RTL), Firebase project + emulators, CI/CD, ESLint/Prettier, folder structure, Zustand store skeleton, shared `useDocument`/`useCollection` hooks | 1–2 wks |
| 1 | Auth + RBAC: login, custom claims via Cloud Function, protected routes, `users` CRUD, `rolePermissions` admin editor | 1–2 wks |
| 2 | Lookup collections (governorates/cities/villages/caseTypes/assistanceTypes/expenseCategories) + admin CRUD screens | 1 wk |
| 3 | Beneficiary Case core: CRUD, family members, normalized search fields, list/search/filter, PII document-split + configurable-permission rules, soft delete | 2–3 wks |
| 4 | Attachments collection + Storage structure + thumbnail generation (shared across cases/visits/assistance/donors/expenses) | 1 wk |
| 5 | Social Research Visits + Reminders module + reminder-due Cloud Function | 1–2 wks |
| 6 | Donor & Donation management (soft delete included) | 1–2 wks |
| 7 | Assistance management + ledger/`financialSummary` Cloud Functions (highest-risk module — transactional integrity) | 2 wks |
| 8 | Expense management | 1 wk |
| 9 | Notifications module (collection, Cloud Functions triggers, dashboard badge/panel) | 1 wk |
| 10 | Field-change history tracking (`fieldHistory` trigger + UI tab) | 3–5 days |
| 11 | Dashboard & analytics (activity feed, notifications, rollup docs, all widgets in §9) | 2 wks |
| 12 | Reports (client-side small reports; server-side job pattern for large) | 1–2 wks |
| 13 | Audit log + Security Rules test suite (Firestore emulator rules-unit-testing, incl. soft-delete and rolePermissions cases) | 1–1.5 wks |
| 14 | PWA/offline shell, performance pass, accessibility, RTL polish | 1 wk |
| 15 | QA/UAT, scheduled backups, monitoring, production deploy | 1–2 wks |

**Total: ~20–26 weeks** for a single full-stack developer; compressible with a second engineer on independent
modules (Phases 5–8, or Phase 9 in parallel with Phase 11) once Phases 0–3 foundations land.

---

## 13. Open Decisions Needing Your Sign-off

1. **Sensitive-field split** (`cases/{id}/private/pii` subcollection) — adds one extra read per case detail view for privileged roles, in exchange for real field-level access control. Alternative: keep PII flat and simply hide it in the UI for `financial_officer` (cheaper, but not a real security boundary — a `financial_officer` could read raw Firestore data with dev tools). **Recommend the split**, now paired with the `rolePermissions` toggle (§3, §8) so the org can decide per-field visibility without a rules redeploy.
2. **Report generation**: confirm you're fine with a two-tier approach (client-side for small, async Cloud-Function job for large) rather than always server-side (simpler but costs a Functions invocation even for a 5-row export) or always client-side (breaks on annual reports with thousands of rows).
3. **Segregation of duties** (§3): confirm the `financial_officer` vs `case_reviewer`/`admin` approval split for assistance disbursement matches how your organization actually wants sign-off to work — this shapes the Security Rules and the assistance state machine.
4. Confirm assumption in §1 about user-scale vs data-scale.
5. **Notification fan-out at scale** (§14): confirm the org's typical broadcast size (e.g. "notify all researchers") — if it can exceed a few hundred recipients, the write-per-recipient pattern in §6.4 needs the hybrid mitigation discussed in §14 before launch, not after.
6. **Multi-field/fuzzy search** (§6, design principle #6): normalized fields solve prefix search on a single field; confirm whether "search by name OR phone in one box" is a hard requirement — if so, a dedicated search index (Algolia/Typesense) should be scoped into the roadmap now rather than retrofitted.

Once you approve/adjust the above, I'll proceed to code — starting with Phase 0 scaffolding.

---

## 14. Final Architecture Review (CTO pass)

Reviewing this as a CTO signing off before implementation — issues below are things I would block on, or at
least want explicitly acknowledged, before Phase 0 starts.

### Scalability
- **Notification fan-out.** Writing one `notifications` doc per recipient is correct for targeted notifications
  (assign a case to one researcher) but breaks down for broadcast events (e.g. "notify all `admin` + all
  `case_reviewer`" on a critical case). At tens of recipients this is fine; at hundreds+ it's a burst of writes
  from a single Cloud Function invocation and a real cost/latency concern. **Mitigation**: cap true fan-out to
  small, targeted recipient sets (assignment-style notifications); for genuinely broadcast events, use a
  role-scoped query at read time (dashboard queries `notifications where audienceRole == 'admin'`, one doc, N
  readers) instead of N docs. Decide this per notification type at Phase 9, not generically.
- **Dashboard rollups need a reconciliation job.** Incremental rollup docs (`dashboardStats/*`, §9) can drift
  from ground truth if a trigger fails mid-write or retries incorrectly. Add a scheduled (e.g. nightly)
  reconciliation Cloud Function that recomputes rollups from source collections and corrects drift — the same
  pattern already used for `financialSummary` should extend here rather than being reinvented per-rollup type.
- **Soft delete + indexes.** Every `isDeleted`-leading composite index (§6) roughly doubles index storage vs.
  no soft delete. Acceptable at this data volume, but worth monitoring Firestore index count against the
  per-project limit as more lookup/history collections are added.

### Security
- **`attachments` cross-collection access control is the highest-risk new surface.** A single `attachments`
  collection spanning six `ownerCollection` values means the read/write rule (§8) must correctly re-derive
  permission from the *owning* document for every owner type — a mistake here (e.g. forgetting the
  `financial_officer`/PII interaction for `ownerCollection == 'cases'`) silently leaks case documents attached
  to a case. **Mitigation**: the Rules `allow read` for `attachments` should call a per-`ownerCollection`
  permission-check function (mirroring the same role logic as the owning document's own read rule), not a
  single broad role list — and this needs its own dedicated rules-unit-test file before launch, not
  incidental coverage.
- **Storage Rules must independently re-derive the same ownership check**, since Storage Rules can't read
  Firestore documents cheaply in the same way — confirm the path-based checks in §7 are kept in lock-step with
  the `attachments` Firestore rule as both evolve; a drift here is a classic "Firestore says no, Storage says
  yes" bug class.
- **`rolePermissions` is itself a privilege-escalation surface.** Only `super_admin` may write it (§8) — correct
  — but because Rules `get()` it live, a bug that allows a broader role to write `rolePermissions` would
  instantly widen data access across the whole app. Recommend this collection get its own focused rules test
  and a Cloud Function audit-log entry on every write (it already flows through `auditLogs` as a normal write,
  but flag it explicitly in the admin UI as a sensitive action).

### Maintainability
- **Two history mechanisms (`statusHistory` and `fieldHistory`) overlap on `status` changes** (§6.7 notes this
  explicitly). Confirm the UI actually needs both, or have `fieldHistory`'s trigger simply skip `status` (since
  `statusHistory` already covers it with richer context — `reason`, workflow-specific) to avoid duplicate
  writes and two-tabs-showing-the-same-thing UX confusion.
- **Removing TanStack Query shifts loading/error-state consistency onto the shared hooks.** Without a library
  enforcing a consistent shape, `useDocument`/`useCollection` must be written once, well-tested, and used
  everywhere — audit for any feature that starts hand-rolling its own `onSnapshot` instead of using the shared
  hook, since that's exactly the boilerplate duplication TanStack Query was hiding.

### Firestore / Performance
- **Normalized search fields need trigger-maintained consistency**, not application-level "remember to update
  it" discipline — confirmed already in §6 design principle #6, flagging here only to make sure the Cloud
  Functions trigger is scoped into Phase 3, not treated as optional polish.
- **Lookup collections fetched in full client-side** (§6.5) is fine while each stays in the tens-to-low-hundreds
  range; if `villages` in particular grows into the thousands (plausible for a large country), switch it to a
  paginated/typeahead query instead of a full client-side cache — flag as a watch item, not a blocker.

### UX
- **Unread notification badge via live query, not a counter doc** (§6.4) is the right v1 tradeoff, but if a
  power user accumulates thousands of unread notifications the `where(read == false)` listener becomes
  expensive on both ends. The 90-day retention purge (§6.4) bounds this in practice; still worth a defensive
  cap (e.g. only badge up to "99+") in the UI.
- **Attachments and reminders both surface inside the case detail view** (§10) — with family members, visits,
  status history, and field history also tabbed there, the case detail page is accumulating a lot of surface
  area. Not an architectural blocker, but flag for the design phase: this page will need careful information
  architecture (likely progressive disclosure / collapsed-by-default secondary tabs) to stay usable, not a flat
  list of eight equal-weight tabs.

None of the above block starting Phase 0 — they're scoped fixes to land in the phases where they're introduced
(fan-out mitigation by Phase 9, attachments rules-test by Phase 4, reconciliation job by Phase 11) rather than
upfront redesign.
