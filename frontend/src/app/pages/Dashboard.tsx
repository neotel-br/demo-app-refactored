import { Card } from "../components/ui/card";
import { ArrowUp, ArrowDown, Shield, Key, Eye, Activity, ArrowRight, Zap } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";

// Mock data for demonstration
const metrics = [
  {
    title: "Total Tokens Generated",
    value: "12,847",
    change: "+12.3%",
    trend: "up",
    icon: Key,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Fields Masked",
    value: "8,392",
    change: "+8.7%",
    trend: "up",
    icon: Eye,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Active Policies",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Shield,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "API Requests",
    value: "45,291",
    change: "+18.2%",
    trend: "up",
    icon: Activity,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "tokenize",
    description: "Credit card tokenized",
    data: "4532 **** **** 8790",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "mask",
    description: "SSN masked",
    data: "***-**-4521",
    timestamp: "5 minutes ago",
    status: "success",
  },
  {
    id: 3,
    type: "tokenize",
    description: "Email tokenized",
    data: "john.doe@example.com",
    timestamp: "8 minutes ago",
    status: "success",
  },
  {
    id: 4,
    type: "mask",
    description: "Phone number masked",
    data: "***-***-8901",
    timestamp: "12 minutes ago",
    status: "success",
  },
  {
    id: 5,
    type: "tokenize",
    description: "Bank account tokenized",
    data: "****5678",
    timestamp: "15 minutes ago",
    status: "success",
  },
];

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor tokenization activity and system metrics</p>
      </div>

      {/* Quick Actions Banner */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-blue-500/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Ready to tokenize data?</h2>
            <p className="text-slate-300 text-sm">Transform sensitive information into secure tokens in seconds</p>
          </div>
          <div className="flex gap-3">
            <Link to="/tokenize">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Shield className="w-4 h-4 mr-2" />
                Tokenize Now
              </Button>
            </Link>
            <Link to="/api-console">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Zap className="w-4 h-4 mr-2" />
                API Console
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="bg-slate-900 border-slate-800 p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <Badge
                variant="secondary"
                className={`${
                  metric.trend === "up"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {metric.trend === "up" ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {metric.change}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-sm text-slate-400">{metric.title}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <p className="text-sm text-slate-400 mt-1">Latest tokenization and masking operations</p>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              Live
              <span className="ml-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </Badge>
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="p-6 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === "tokenize"
                        ? "bg-blue-500/10"
                        : "bg-purple-500/10"
                    }`}
                  >
                    {activity.type === "tokenize" ? (
                      <Key className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.description}</p>
                    <p className="text-slate-400 text-sm mt-1 font-mono">{activity.data}</p>
                    <p className="text-slate-500 text-xs mt-2">{activity.timestamp}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                >
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Data Protection Rate</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">98.7%</span>
            <span className="text-emerald-400 text-sm mb-1">↑ 2.3%</span>
          </div>
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-[98.7%] bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Average Response Time</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">34ms</span>
            <span className="text-emerald-400 text-sm mb-1">↓ 8ms</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Last 24 hours</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">System Status</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xl font-bold text-white">Operational</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">All systems running normally</p>
        </Card>
      </div>
    </div>
  );
}