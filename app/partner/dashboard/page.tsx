'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_services: number;
  active_services: number;
  total_sales: number;
  pending_quotations: number;
  this_month_earnings: number;
  total_earnings: number;
}

interface Service {
  id: string;
  title: string;
  service_type: string;
  price: number;
  is_published: boolean;
  created_at: string;
  view_count: number;
  purchase_count: number;
}

export default function PartnerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);

      // Load services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });

      // Load orders
      const { data: orders } = await supabase
        .from('orders')
        .select('partner_amount, status, created_at')
        .eq('partner_id', user.id)
        .eq('status', 'completed');

      // Calculate stats
      const activeServices = services?.filter((s) => s.is_published === true).length || 0;
      const totalSales = orders?.length || 0;
      const totalEarnings = orders?.reduce((sum, o) => sum + (o.partner_amount || 0), 0) || 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthEarnings =
        orders
          ?.filter((o) => new Date(o.created_at) >= thisMonth)
          .reduce((sum, o) => sum + (o.partner_amount || 0), 0) || 0;

      setStats({
        total_services: services?.length || 0,
        active_services: activeServices,
        total_sales: totalSales,
        pending_quotations: 0,
        this_month_earnings: thisMonthEarnings,
        total_earnings: totalEarnings,
      });

      setRecentServices(services?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">파트너 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">
                {userProfile?.display_name || userProfile?.name || '파트너'}님, 환영합니다! 👋
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/partner/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <UserCircleIcon className="h-5 w-5" />
                프로필 설정
              </Link>
              <Link
                href="/partner/dashboard/services/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
                새 서비스 등록
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ShoppingBagIcon className="h-6 w-6" />}
            title="등록된 서비스"
            value={stats?.total_services || 0}
            subtitle={`활성: ${stats?.active_services || 0}개`}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            title="이번 달 수익"
            value={`₩${(stats?.this_month_earnings || 0).toLocaleString()}`}
            subtitle="파트너 수익 (90%)"
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="총 판매"
            value={stats?.total_sales || 0}
            subtitle="완료된 주문"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
            title="총 수익"
            value={`₩${(stats?.total_earnings || 0).toLocaleString()}`}
            subtitle="누적 수익"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        {/* Recent Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">최근 등록 서비스</h2>
            <Link
              href="/partner/dashboard/services"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              전체 보기 →
            </Link>
          </div>

          {recentServices.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">등록된 서비스가 없습니다.</p>
              <Link
                href="/partner/dashboard/services/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
                첫 서비스를 등록해보세요
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => router.push(`/partner/dashboard/services`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{service.title}</h3>
                      {service.is_published ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          게시중
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          비공개
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>₩{service.price.toLocaleString()}</span>
                      <span>조회 {service.view_count || 0}</span>
                      <span>판매 {service.purchase_count || 0}</span>
                      <span>{new Date(service.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/services/${service.id}`);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 transition"
                      title="미리보기"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/partner/dashboard/services?edit=${service.id}`);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 transition"
                      title="수정"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ icon, title, value, subtitle, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
