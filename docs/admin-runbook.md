# Admin runbook

The admin menu has five groups in the left sidebar. Press the menu button in the header to collapse it.

## Overview

| Screen | Use |
| --- | --- |
| Dashboard | Counts and work waiting |
| Reports | Platform reports |
| World Map | Where users and institutes are |
| AI Insights | AI usage and insights |

## Verification & Moderation

### Verify an account

1. Open **User Verification & Approval** and choose a request.
2. Check each document. An **Alternate document** badge means the person did not have the required paper. Read their note and judge whether it is enough.
3. Approve, reject with a reason, or ask for specific documents again. The person is told.

Replacing an identity document on an approved account sends it back for review.

### Automatic checks and removal

Posts go live after an automatic check, with no approval for each post.

- **Held Jobs**, **Held Scholarships** and **Held Listings** show what the check stopped. Allow or reject them.
- **Remove Fake Posts** removes a job, product or scholarship. The owner sees your reason.
- **Comments & Ratings** hides or restores reviews.
- **Complaint Management** handles complaints.

## Academic Operations

**Institution Management**, **All Users**, **Staff Management**, **Agent Management**, **Donor Management**, **Employer Management** and **Visa Center** manage these accounts. For an agent you can also apply a posting ban or cancel a licence. **Staff Management** sets which departments each staff member can open.

## Finance & Commercial

### Confirm a payment

1. Open **Financial Management** and find the payment.
2. Check the transaction ID, date, amount and receipt against your bank. Call the number shown if you are unsure.
3. Approve or reject with a reason. Approval applies the payment and issues the receipt.

Payments with a seller have two steps: first CareerZ's fee, then the seller's receipt.

### Change commission

- **Financial Management** holds the plain rate for each service.
- **Commission Rules** adds rates by country, category, institution or product, with optional dates and a fixed fee. The most specific active rule wins: product, institution, category, country, everywhere. With no matching rule, the plain rate applies.
- Two active rules cannot cover the same service and scope in overlapping dates.
- Only the Super Admin can change rates. Every change is kept under **History** with who made it and when.
- A new rate affects new payments, not payments already made.

### Receipts

**Receipts** lists every receipt. Receipts cannot be changed after they are issued. Each has a QR code that opens a public check page, which does not name the people.

Set **Tax** and **Gateway charges** on the same screen. Both default to 0. Tax is a percentage of CareerZ's commission, and gateway charges apply only to gateway payments. Both come out of CareerZ's share, so the seller's amount does not change. Ask your accountant what rates apply.

### Settle a dispute

- **Marketplace Escrow & Disputes**: decide a marketplace order.
- **Freelancer Hub**: open disputes show the order, milestone, reason and evidence. Choose **Pay the freelancer** or **Refund the client**, and write a reason both sides will see. A refund returns the milestone amount to the client's wallet. CareerZ's fee is not refunded.

### Withdrawals

Withdrawal requests reserve the money in the wallet. Make the real payout outside CareerZ, then record it.

### Recruitment

**Recruitment Payments** confirms invoices for agent and institute recruitment.

## System Administration

| Screen | Use |
| --- | --- |
| Global Settings | Countries, currencies, languages and site settings |
| Operations Center | Branding, pages and operations tools |
| Plugins & Modules | Turn optional modules off, and manage webhooks |
| Ads Management | Choose banners or Google AdSense, and placements |
| Content (Pages & Blog) | Edit website pages and blog posts without code |
| Security & Monitoring | Security events and blocked addresses |
| Backups & Maintenance | Download backups and turn on maintenance mode |
| My AI Key | The AI key for your own use |

### Ads

Ads never run on live classes, exams, chat, wallet or payment screens. AdSense runs on public pages only and needs the ad unit ID from your AdSense account.

### Maintenance mode

Turn it on under **Backups & Maintenance** before planned work. Only the Super Admin can use the platform while it is on, and everyone else sees a notice. Turn it off when finished.

### User access

Suspend an account from **All Users**. Staff access comes from **Staff Management**.

### Backups and restoring data

Download a backup under **Backups & Maintenance**. Restoring is deliberately not a button, because it overwrites live data. A developer restores it: see [Restore a backup](developer-guide.md#restore-a-backup).
