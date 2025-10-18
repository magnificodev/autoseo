'use client';

import { useState } from 'react';
import { 
  Globe, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  postsCount: number;
  keywordsCount: number;
}

export default function ModernSitesPage() {
  const [sites] = useState<Site[]>([
    {
      id: '1',
      name: 'Tech News Blog',
      url: 'https://technews.example.com',
      status: 'active',
      lastSync: '2 hours ago',
      postsCount: 45,
      keywordsCount: 23
    },
    {
      id: '2',
      name: 'Marketing Blog',
      url: 'https://marketing.example.com',
      status: 'error',
      lastSync: '6 hours ago',
      postsCount: 32,
      keywordsCount: 18
    },
    {
      id: '3',
      name: 'Business Blog',
      url: 'https://business.example.com',
      status: 'active',
      lastSync: '1 hour ago',
      postsCount: 28,
      keywordsCount: 15
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="modern-badge modern-badge-success">Active</span>;
      case 'error':
        return <span className="modern-badge modern-badge-danger">Error</span>;
      default:
        return <span className="modern-badge modern-badge-warning">Inactive</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sites Management</h1>
          <p className="text-gray-400">
            Manage your connected WordPress sites and monitor their status.
          </p>
        </div>
        <button className="modern-btn modern-btn-primary">
          <Plus className="w-4 h-4" />
          Add New Site
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="modern-metric-card">
          <div className="modern-metric-label">Total Sites</div>
          <div className="modern-metric-value">{sites.length}</div>
          <div className="modern-metric-change positive">
            <span>+2 this month</span>
          </div>
        </div>
        <div className="modern-metric-card">
          <div className="modern-metric-label">Active Sites</div>
          <div className="modern-metric-value">{sites.filter(s => s.status === 'active').length}</div>
          <div className="modern-metric-change positive">
            <span>All systems operational</span>
          </div>
        </div>
        <div className="modern-metric-card">
          <div className="modern-metric-label">Total Posts</div>
          <div className="modern-metric-value">{sites.reduce((sum, site) => sum + site.postsCount, 0)}</div>
          <div className="modern-metric-change positive">
            <span>+12 this week</span>
          </div>
        </div>
        <div className="modern-metric-card">
          <div className="modern-metric-label">Keywords Tracked</div>
          <div className="modern-metric-value">{sites.reduce((sum, site) => sum + site.keywordsCount, 0)}</div>
          <div className="modern-metric-change positive">
            <span>+8 this week</span>
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="flex items-center justify-between">
            <h3 className="modern-card-title">Connected Sites</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sites..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button className="modern-btn modern-btn-secondary">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="modern-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Site</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Sync</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Posts</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Keywords</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{site.name}</div>
                          <div className="text-sm text-gray-400">{site.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(site.status)}
                        {getStatusBadge(site.status)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{site.lastSync}</td>
                    <td className="py-4 px-4 text-white">{site.postsCount}</td>
                    <td className="py-4 px-4 text-white">{site.keywordsCount}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
