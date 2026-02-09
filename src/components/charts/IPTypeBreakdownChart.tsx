import { useEffect, useState } from 'react';
import { Award, Users, Target } from 'lucide-react';

interface IPTypeBreakdownChartProps {
  logo: {
    posts: number;
    engagement: number;
    lift: number;
  };
  collaboration: {
    posts: number;
    engagement: number;
    lift: number;
  };
  mention: {
    posts: number;
    engagement: number;
    lift: number;
  };
  formatNumber: (num: number) => string;
}

export function IPTypeBreakdownChart({ logo, collaboration, mention, formatNumber }: IPTypeBreakdownChartProps) {
  const [animate, setAnimate] = useState(false);

  // Mention data is intentionally unused (blurred in UI)
  void mention;

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate max for scaling (excluding mention since it's blurred)
  const maxEngagement = Math.max(logo.engagement, collaboration.engagement);

  // Calculate percentages for bar widths
  const logoPercent = (logo.engagement / maxEngagement) * 100;
  const collaborationPercent = (collaboration.engagement / maxEngagement) * 100;

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-8">
      <h4 className="text-xl font-bold text-white mb-6">IP Type Performance Comparison</h4>
      <p className="text-white/60 text-sm mb-8">Total engagement and lift by IP type</p>

      <div className="space-y-6">
        {/* LOGO */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-white font-semibold">Visual IP</div>
                <div className="text-white/60 text-xs">{logo.posts} posts</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{formatNumber(logo.engagement)}</div>
              <div className="text-blue-500 text-sm font-semibold">+{logo.lift}%</div>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: animate ? `${logoPercent}%` : '0%'
              }}
            />
          </div>
        </div>

        {/* COLLABORATION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-white font-semibold">Collaboration</div>
                <div className="text-white/60 text-xs">{collaboration.posts} posts</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{formatNumber(collaboration.engagement)}</div>
              <div className="text-green-500 text-sm font-semibold">+{collaboration.lift}%</div>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: animate ? `${collaborationPercent}%` : '0%'
              }}
            />
          </div>
        </div>

        {/* MENTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-white font-semibold">Mention</div>
                <div className="text-white/60 text-xs filter blur-sm select-none">892 posts</div>
              </div>
            </div>
            <div className="text-right filter blur-sm select-none pointer-events-none">
              <div className="text-white font-bold">1.8M</div>
              <div className="text-yellow-500 text-sm font-semibold">+1834%</div>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden filter blur-sm pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: animate ? '45%' : '0%'
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-white/60 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <span className="font-bold text-white">Key Insight:</span> Visual IP drives the highest total engagement,
        followed by Collaboration and Mention. All IP types show positive engagement lift.
      </div>
    </div>
  );
}
