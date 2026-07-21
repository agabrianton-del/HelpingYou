import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to HelpingYou</h1>
        <p>Get help from the community or help others today</p>
      </section>

      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>📝 Create Requests</h3>
            <p>Post your questions or requests and get help from the community</p>
          </div>
          <div className="feature-card">
            <h3>💬 Share Responses</h3>
            <p>Help others by sharing your knowledge and expertise</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Rate & Review</h3>
            <p>Rate responses and provide feedback to build a trusted community</p>
          </div>
          <div className="feature-card">
            <h3>🏆 Earn Badges</h3>
            <p>Get recognized for your contributions and become a trusted helper</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
