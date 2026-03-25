# Project Alexandria

For BRACU CSE470
Team: Promit, Kazi, Naziba, Hritik

## 1) Product Vision
Project Alexandria is a collaborative course resource library where students can:
- browse courses and topics,
- discover resources by section (`videos`, `slides`, `notes`, `resources`, `additional`),
- vote and annotate links,
- submit new links,
- report broken/low-quality links,
- rely on admin moderation before publication.

Core rule: student submissions are never published directly. Everything goes through review.

## 2) Current Architecture
- Frontend: React + Vite in `src/`.
- Backend: Express + Mongoose in `backend/`.
- Auth: JWT (`Bearer` token), role-based (`student`, `admin`).
- Data: MongoDB with local connection + in-memory fallback for testing.
- Startup: backend seeds sample data automatically when needed.

### Backend structure (modularized)
- Entry/bootstrap: `backend/server.js`
- Routes:
	- `backend/routes/authRoutes.js`
	- `backend/routes/libraryRoutes.js`
	- `backend/routes/adminRoutes.js`
- Middleware:
	- `backend/middleware/auth.js`
	- `backend/middleware/requireAdmin.js`
- Utilities:
	- `backend/utils/requestUtils.js`
	- `backend/utils/resourceUtils.js`

### Frontend structure (optimized)
- Main screen: `src/Library.jsx` (container/composition only)
- Hooks:
	- `src/hooks/useAuthSession.js`
	- `src/hooks/useCourseCatalog.js`
	- `src/hooks/useLibraryWorkbench.js`
- Components:
	- `src/components/CourseTreePanel.jsx`
	- `src/components/TopicWorkbench.jsx`
	- `src/components/ResourceCard.jsx`
	- `src/components/SubmitResourceForm.jsx`
	- `src/components/AdminPanel.jsx`
- Shared constants:
	- `src/constants/librarySections.js`

## 3) Implemented Features
- Auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- Tree-based course/topic navigation.
- Sectioned resource browsing per topic.
- Vote system (server-side integrity with one vote per user/resource).
- Resource description editing (authenticated).
- Resource submission flow (pending moderation).
- Resource report flow.
- Admin moderation dashboard in frontend:
	- approve/reject submissions,
	- resolve/dismiss reports,
	- delete any resource.
- Pagination on admin list endpoints.
- Seeded test users/data for quick local testing.

## 4) Data Model Snapshot
- `Course`
- `Topic`
- `Resource`
- `LinksInfo`
- `User`
- `ResourceSubmission`
- `ResourceReport`
- `ResourceVote`

Section enum used consistently:
- `videos`, `slides`, `notes`, `resources`, `additional`

## 5) API Summary
Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Library read:
- `GET /api/topics`
- `GET /api/topics/:courseid`
- `GET /api/alltopics`
- `GET /api/allresources`
- `GET /api/resources/:courseid/:topic`

Resource interactions (auth required):
- `POST /api/resources/:courseid/:topic/like`
- `POST /api/resources/:courseid/:topic/dislike`
- `POST /api/resources/:courseid/:topic/description`
- `POST /api/resources/:courseid/:topic/report`
- `POST /api/resources/:courseid/:topic` (submit resource)

Admin (admin role required):
- `GET /api/admin/submissions`
- `POST /api/admin/submissions/:id/approve`
- `POST /api/admin/submissions/:id/reject`
- `GET /api/admin/reports`
- `POST /api/admin/reports/:id/resolve`
- `POST /api/admin/resources/delete`

## 6) Environment
Root `.env`:
- `VITE_API_URL=http://localhost:5000`

Backend `.env`:
- `MONGO_URL=mongodb://localhost:27017/courselibrary`
- `JWT_SECRET=change_this_for_local_testing`
- `PORT=5000`

## 7) Build and Run
Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd ..
npm install
npm run dev
```

Production build:
```bash
npm run build
```

Optional seed reset:
```bash
cd backend
npm run seed
```

## 8) Current Priorities
1. Add user profile/history view (submitted, approved, rejected, reported).
2. Add threaded comments/discussion per resource.
3. Add first-admin bootstrap strategy and safer production role provisioning.
4. Prepare reward/reputation layer after moderation and profile flows are stable.
