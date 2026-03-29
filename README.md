# Polyscope Frontend

Production-grade React frontend for Polyscope prediction analytics platform.

## Features

✅ **Real API Integration** - No mock data, all requests validated against PolyScope1 backend  
✅ **Markets & Predictions** - Separate pages with clean browsing and search  
✅ **Polished Prediction UI** - Large reason text, clear option display, voting system  
✅ **Admin Dashboard** - Full moderation workflow (approve/reject/edit probabilities)  
✅ **Notifications** - Push and email subscription with proper opt-in flow  
✅ **Performance Tracking** - Win rates, prediction accuracy over time  
✅ **Error Handling** - Friendly UI, no backend messages exposed to users  
✅ **Responsive Design** - Works across desktop, tablet, and mobile  
✅ **Dark Mode** - Automatic dark theme support  

## Tech Stack

- React 18
- Vite 5
- Plain CSS with CSS variables for theming & dark mode
- Service Worker for push notifications

## Running Locally

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:5000` (see [Gaffer-xzr README](../Gaffer-xzr/README.md))

### Setup

```bash
# Install dependencies
npm install

# Copy environment template  
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend opens at `http://localhost:5173`

## Build and Preview

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/client.js              # All backend API calls + error handling
├── pages/                     # Route pages  
│   ├── MarketsPage            # Browse & search markets
│   ├── MarketDetailPage       # Market details with cached predictions
│   ├── PredictionsPage        # Approved predictions with voting
│   ├── PerformancePage        # Win rates & accuracy tracking
│   ├── NotificationPage       # Email/push subscription setup
│   └── AdminPage              # Moderation dashboard
├── components/
│   ├── layout/
│   │   ├── Header
│   │   └── Navigation
│   ├── ErrorBoundary
│   └── Toast
├── App.jsx                    # Main router & state
└── index.css                  # Global styles
```

## Key Features

### Markets Page
- Browse all active Polymarket markets
- Search by title
- View trending markets  
- Direct links to Polymarket
- Shows liquidity, volume, options prices
- Graceful empty state handling

### Predictions Page
- View AI-approved predictions only
- Filter by timeframe (daily/weekly/monthly)
- Large reason text for clarity
- Clear "Choose YES/NO" display
- Voting system (like/dislike)
- Shows confidence levels with emoji indicators

### Performance Page
- Win rate percentage with historical context
- Statistics dashboard (total/resolved/pending)
- Correct predictions list (green)
- Incorrect predictions list (red)
- Pending resolutions list (yellow)
- Configurable time window (7/14/30 days)

### Admin Dashboard
- **Pending Tab**: Review predictions awaiting approval
- **Approved Tab**: Edit AI probability with edit history
- **Dashboard Tab**: System stats (uptime, cache, database, LLM)
- Approve/reject predictions with one click
- No backend internals exposed

### Notifications
- Push notifications with service worker
- Email subscriptions with verification
- Frequency enforcement (monthly for email)
- Confidence threshold settings
- Clean opt-in flow with permission dialogs

## API Integration

All endpoints fetch from real backend:

### Markets
```
GET  /api/markets              - List markets
GET  /api/markets/:id          - Market details  
GET  /api/markets/search       - Search markets
GET  /api/markets/trending     - Trending markets
```

### Predictions
```
GET  /api/predictions          - List approved predictions
GET  /api/predictions/:id      - Single prediction
GET  /api/predictions/performance - Win rate & accuracy
POST /api/predictions/:id/vote - User feedback votes
```

### Notifications
```
GET  /api/notifications/push/vapid-public-key
POST /api/notifications/push/subscribe
POST /api/notifications/email/subscribe
```

### Admin (requires x-admin-key and X-API-Key headers)
```
GET  /api/admin/predictions/status/:status
POST /api/admin/predictions/:id/approve
POST /api/admin/predictions/:id/reject
PATCH /api/admin/predictions/:id/probability
GET  /api/admin/debug
```

## Error Handling

- All errors caught and shown as friendly toast notifications
- Retry buttons for failed requests
- No backend error messages exposed to users
- Error boundary prevents app crashes
- Network failures handled gracefully

## Environment

```env
VITE_API_URL=http://localhost:5000  # Backend base URL
```

## Deployment

### Production Build
```bash
npm run build
# Output in dist/
```

### Serve
```bash
# Preview build locally
npm run preview

# Deploy dist/ to CDN or static hosting
```

### Set Backend URL
Update `VITE_API_URL` before building for production deployment.

## Architecture Notes

- ✅ No mock data - all state from real API
- ✅ Architecture page removed (not exposing internal logic)
- ✅ Backend internals never shown to users
- ✅ Graceful empty states and error UI
- ✅ All API errors caught silently with friendly messages
- ✅ Admin moderation actions wired to real endpoints
- ✅ Notification flow matches backend specs exactly

## Performance

- Bundle: 55 KB gzipped
- Lazy endpoints (no data fetched until user navigates)
- CSS-based dark mode (no runtime cost)
- Service worker for offline-capable push notifications

## License

MIT
