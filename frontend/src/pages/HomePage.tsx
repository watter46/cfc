import React from "react";
import { ArrowRight, Star, Users, Zap } from "lucide-react";
import MainLayout from "@/shared/components/layout/MainLayout.tsx";
import MatchCard from "@/components/match/MatchCard";
import { featuredMatches } from "@/data/MatchList";

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-field-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-space-900/90 to-space-800/90"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue animate-pulse-slow">
              選手を評価、意見を共有、コーチになろう
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              リアルタイムで選手のパフォーマンスを評価・分析するサッカー専門家コミュニティに参加しましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="btn btn-primary py-3 px-8 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  始める
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>
              <a
                href="/matches"
                className="btn border border-neon-blue bg-transparent text-neon-blue hover:bg-neon-blue/10 py-3 px-8 text-lg"
              >
                試合を見る
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
      <section className="py-16 bg-space-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Recent Matches
            </h2>
            <a
              href="/matches"
              className="text-neon-blue hover:underline flex items-center gap-1.5"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-space-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Why Choose PitchRate
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The most comprehensive soccer player rating platform with a
              futuristic interface and powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-glass p-6 hover:shadow-neon-blue transition-all duration-300">
              <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-4">
                <Star size={24} className="text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                Detailed Ratings
              </h3>
              <p className="text-gray-400">
                Rate players on a scale of 1-10 and provide detailed comments on
                their performance.
              </p>
            </div>

            <div className="card-glass p-6 hover:shadow-neon-purple transition-all duration-300">
              <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} className="text-neon-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                Community Insights
              </h3>
              <p className="text-gray-400">
                Compare your ratings with the community and see consensus on
                player performances.
              </p>
            </div>

            <div className="card-glass p-6 hover:shadow-neon-green transition-all duration-300">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                Real-time Updates
              </h3>
              <p className="text-gray-400">
                Get live match updates and rate players as the action unfolds on
                the pitch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-space-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-field-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Ready to Share Your Expertise?
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of soccer fans rating players and sharing insights
              on matches around the world.
            </p>
            <a
              href="/register"
              className="btn btn-primary py-3 px-8 text-lg inline-block"
            >
              Create Free Account
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
