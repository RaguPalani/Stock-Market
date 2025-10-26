import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './activities.css';

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile');
      setActivities(response.data.data.user.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'buy': return '🛒';
      case 'sell': return '💰';
      case 'deposit': return '💳';
      default: return '📝';
    }
  };

  const getActivityColorClass = (type) => {
    switch (type) {
      case 'login': return 'activity-login';
      case 'logout': return 'activity-logout';
      case 'buy': return 'activity-buy';
      case 'sell': return 'activity-sell';
      case 'deposit': return 'activity-deposit';
      default: return 'activity-default';
    }
  };

  if (loading) {
    return (
      <div className="activities-loading">
        <div className="activities-spinner"></div>
      </div>
    );
  }

  return (
    <div className="activities-container">
      <div className="activities-content">
        <div className="activities-header fade-in">
          <h1 className="activities-title">Activity Log 📝</h1>
          <p className="activities-subtitle">Track your account activities and transactions</p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-container slide-up">
          {['all', 'login', 'logout', 'buy', 'sell', 'deposit'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`filter-button ${
                filter === filterType ? 'active' : 'inactive'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Activities List */}
        <div className="activities-section fade-in">
          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p className="empty-title">No activities found</p>
              <p className="empty-description">
                {filter === 'all' 
                  ? "Your activities will appear here as you use the platform"
                  : `No ${filter} activities found`
                }
              </p>
            </div>
          ) : (
            <div className="activities-list">
              {filteredActivities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => (
                  <div
                    key={activity._id || index}
                    className="activity-item stagger-item"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="activity-content">
                      <div className={`activity-icon-container ${getActivityColorClass(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="activity-details">
                        <div className="activity-header">
                          <div>
                            <h3 className="activity-title">
                              {activity.type} Activity
                            </h3>
                            <p className="activity-description">
                              {activity.description || `${activity.type} activity performed`}
                            </p>
                          </div>
                          
                          <div className="activity-time">
                            <div className="activity-date">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
                            <div className="activity-timestamp">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {activities.length > 0 && (
          <div className="statistics-grid slide-up">
            {['login', 'logout', 'buy', 'sell', 'deposit'].map((type) => {
              const count = activities.filter(a => a.type === type).length;
              return (
                <div
                  key={type}
                  className="stat-card"
                >
                  <div className="stat-icon">{getActivityIcon(type)}</div>
                  <div className="stat-count">{count}</div>
                  <div className="stat-label">{type}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;