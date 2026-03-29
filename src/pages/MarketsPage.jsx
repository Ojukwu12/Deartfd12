import { useState, useEffect } from 'react';
import { marketsAPI, ApiError } from '../api/client';
import './MarketsPage.css';

const getPolymarketUrl = (market) => {
  if (market?.polymarketUrl) return market.polymarketUrl;
  if (market?.slug) return `https://polymarket.com/event/${encodeURIComponent(market.slug)}`;
  return `https://polymarket.com/market/${encodeURIComponent(market?.marketId || '')}`;
};

export default function MarketsPage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'trending'

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
        setMarkets(data.markets || []);
      } else {
        data = await marketsAPI.getMarkets(50, 0);
        setMarkets(data.markets || []);
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
      setMarkets(data.markets || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
            onClick={() => {
              window.open(getPolymarketUrl(market), '_blank', 'noopener,noreferrer');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.open(getPolymarketUrl(market), '_blank', 'noopener,noreferrer');
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
                  <span className="option-price">
                    {(market.currentPrices?.[idx] * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="market-footer">
              <span className="polymarket-link">Opens on Polymarket ↗</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
