import { useState, useEffect } from 'react';
import { marketsAPI, ApiError } from '../api/client';
import './MarketsPage.css';

const getPolymarketUrl = (market) => {
  if (market?.polymarketUrl) return market.polymarketUrl;
  if (market?.slug) return `https://polymarket.com/event/${encodeURIComponent(market.slug)}`;
  return `https://polymarket.com/market/${encodeURIComponent(market?.marketId || '')}`;
};

const parseMaybeArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      // Support simple comma-separated values from upstream adapters.
      if (trimmed.includes(',')) {
        return trimmed
          .split(',')
          .map((item) => item.trim().replace(/^"|"$/g, ''))
          .filter(Boolean);
      }

      // Support single scalar values by returning a one-item array.
      if (trimmed.length > 0) {
        return [trimmed.replace(/^"|"$/g, '')];
      }

      return fallback;
    }
  }
  return fallback;
};

const normalizeMarket = (market) => ({
  ...market,
  options: parseMaybeArray(market?.options, ['Yes', 'No']),
  categories: parseMaybeArray(market?.categories, []),
  currentPrices: parseMaybeArray(market?.currentPrices, [])
});

const extractMarkets = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.markets)) return payload.markets;
  if (Array.isArray(payload?.data?.markets)) return payload.data.markets;
  return [];
};

const parseNumericPrice = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().replace('%', '');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;

    const fallback = parseFloat(normalized);
    if (Number.isFinite(fallback)) return fallback;
  }
  return NaN;
};

const formatOptionPrice = (value) => {
  const numeric = parseNumericPrice(value);
  if (!Number.isFinite(numeric)) return 'N/A';

  const percent = numeric <= 1 ? numeric * 100 : numeric;
  if (!Number.isFinite(percent)) return 'N/A';

  return `${percent.toFixed(0)}%`;
};

export default function MarketsPage({ onOpenPredictionForMarket }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'trending'
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedMarketDetails, setSelectedMarketDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    fetchMarkets();
  }, [viewMode]);

  const fetchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (viewMode === 'trending') {
        data = await marketsAPI.getTrendingMarkets(50);
        setMarkets(extractMarkets(data).map(normalizeMarket));
      } else {
        data = await marketsAPI.getMarkets(50, 0);
        setMarkets(extractMarkets(data).map(normalizeMarket));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Unable to load markets. Please try again.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMarkets();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await marketsAPI.searchMarkets(searchQuery);
      setMarkets(extractMarkets(data).map(normalizeMarket));
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openMarketActions = async (market) => {
    setSelectedMarket(market);
    setSelectedMarketDetails(null);
    setDetailError('');
    setDetailLoading(true);

    try {
      const details = await marketsAPI.getMarketById(market.marketId);
      setSelectedMarketDetails(details);
    } catch {
      setDetailError('Could not load market details. You can still open this market on Polymarket.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeMarketActions = () => {
    setSelectedMarket(null);
    setSelectedMarketDetails(null);
    setDetailError('');
    setDetailLoading(false);
  };

  if (loading) {
    return (
      <div className="markets-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="markets-page">
      <div className="markets-header">
        <div className="markets-title">
          <h2>Markets</h2>
          <p className="markets-subtitle">Explore Polymarket prediction markets</p>
        </div>
        <div className="markets-controls">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('all');
                setSearchQuery('');
              }}
            >
              All
            </button>
            <button
              className={`toggle-btn ${viewMode === 'trending' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('trending');
                setSearchQuery('');
              }}
            >
              Trending
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="error-retry-button" onClick={fetchMarkets}>
            Try Again
          </button>
        </div>
      )}

      {!error && markets.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3>No markets found</h3>
          <p>Try adjusting your search or check back later</p>
        </div>
      )}

      <div className="markets-grid">
        {markets.map((market) => (
          <div
            key={market.marketId}
            className="market-card"
            role="button"
            tabIndex={0}
            onClick={() => openMarketActions(market)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openMarketActions(market);
              }
            }}
          >
            <div className="market-card-header">
              <h3 className="market-title">{market.title}</h3>
              {market.categories && market.categories.length > 0 && (
                <div className="market-badges">
                  {market.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="market-badge">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="market-status-row">
              <span className={`prediction-status ${market.hasPrediction ? 'has' : 'none'}`}>
                {market.hasPrediction ? 'Prediction available' : 'No prediction yet'}
              </span>
            </div>

            <p className="market-description">
              {market.description ? `${market.description.substring(0, 120)}...` : 'Open on Polymarket to view full market details.'}
            </p>

            <div className="market-stats">
              <div className="stat">
                <span className="stat-label">Liquidity</span>
                <span className="stat-value">${market.liquidity?.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">${market.volume24h?.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">End Date</span>
                <span className="stat-value">
                  {new Date(market.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="market-options">
              {market.options?.map((opt, idx) => (
                <div key={idx} className="option-row">
                  <span className="option-name">{opt}</span>
                  <span className="option-price">{formatOptionPrice(market.currentPrices?.[idx])}</span>
                </div>
              ))}
            </div>

            <div className="market-footer">
              <span className="polymarket-link">Open market options</span>
            </div>
          </div>
        ))}
      </div>

      {selectedMarket && (
        <div className="market-modal-overlay" onClick={closeMarketActions}>
          <div className="market-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="market-modal-header">
              <h3>{selectedMarket.title}</h3>
              <button className="modal-close" type="button" onClick={closeMarketActions} aria-label="Close market details">
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="market-modal-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <>
                <p className="market-modal-status">
                  {(selectedMarketDetails?.hasPrediction ?? selectedMarket?.hasPrediction)
                    ? 'This market has at least one approved prediction.'
                    : 'No approved prediction is currently available for this market.'}
                </p>

                {detailError && <p className="market-modal-error">{detailError}</p>}

                <div className="market-modal-actions">
                  {(selectedMarketDetails?.hasPrediction ?? selectedMarket?.hasPrediction) && (
                    <button
                      type="button"
                      className="modal-action prediction"
                      onClick={() => {
                        if (typeof onOpenPredictionForMarket === 'function') {
                          onOpenPredictionForMarket(selectedMarket.marketId);
                          closeMarketActions();
                        }
                      }}
                    >
                      View Prediction
                    </button>
                  )}
                  <button
                    type="button"
                    className="modal-action polymarket"
                    onClick={() => {
                      window.open(getPolymarketUrl(selectedMarketDetails || selectedMarket), '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Go to Polymarket ↗
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
