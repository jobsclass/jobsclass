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
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_services: number;
  active_services: number;
  total_sales: number;
  pending_quotations: number;
  total_reviews: number;
  average_rating: number;
  this_month_earnings: number;
  total_earnings: number;
}

interface Service {
  id: string;
  title: string;
  service_type: string;
  price: number;
  status: string;
  created_at: string;
  view_count: number;
  purchase_count: number;
}

interface Quotation {
  id: string;
  title: string;
  description: string;
  budget_range: string;
  status: string;
  created_at: string;
  user_profiles: {
    display_name: string;
  } | null;
}

export default function PartnerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load stats
      const { data: services } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      const { data: quotations } = await supabase
        .from('quotation_requests')
        .select(`
          *,
          user_profiles!quotation_requests_client_id_fkey(display_name),
          products!inner(user_id)
        `)
        .eq('products.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('amount, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Calculate stats
      const activeServices = services?.filter((s) => s.is_published === true && s.is_available === true).length || 0;
      const totalSales = transactions?.length || 0;
      const totalEarnings =
        transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthEarnings =
        transactions
          ?.filter((t) => new Date(t.created_at) >= thisMonth)
          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const pendingQuotations =
        quotations?.filter((q) => q.status === 'pending').length || 0;

      setStats({
        total_services: services?.length || 0,
        active_services: activeServices,
        total_sales: totalSales,
        pending_quotations: pendingQuotations,
        total_reviews: 0, // TODO: Implement reviews
        average_rating: 0, // TODO: Implement reviews
        this_month_earnings: thisMonthEarnings,
        total_earnings: totalEarnings,
      });

      setRecentServices(services?.slice(0, 5) || []);
      setRecentQuotations(quotations || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const serviceTypeLabels: Record<string, string> = {
    online_course: '온라인 강의',
    one_on_one_mentoring: '1:1 멘토링',
    group_coaching: '그룹 코칭',
    digital_product: '디지털 콘텐츠',
    project_service: '프로젝트 대행',
    consulting: '컨설팅',
    agency_service: '대행 서비스',
    premium_membership: '프리미엄 멤버십',
    live_workshop: '라이브 워크샵',
    promotion_service: '홍보/마케팅 서비스',
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: '활성', color: 'bg-green-500' },
    pending: { label: '대기', color: 'bg-yellow-500' },
    draft: { label: '임시저장', color: 'bg-gray-500' },
    inactive: { label: '비활성', color: 'bg-red-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">파트너 대시보드</h1>
            <p className="text-gray-300 mt-2">서비스 현황과 매출을 한눈에 확인하세요</p>
          </div>
          <Link
            href="/marketplace/products/new"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />새 서비스 등록
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ShoppingBagIcon className="h-6 w-6" />}
            title="등록된 서비스"
            value={stats?.total_services || 0}
            subtitle={`활성: ${stats?.active_services || 0}개`}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            title="이번 달 수익"
            value={`₩${(stats?.this_month_earnings || 0).toLocaleString()}`}
            subtitle={`총 수익: ₩${(stats?.total_earnings || 0).toLocaleString()}`}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="총 판매"
            value={stats?.total_sales || 0}
            subtitle="완료된 거래"
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
            title="대기 중인 견적"
            value={stats?.pending_quotations || 0}
            subtitle="응답 필요"
            color="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Services */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">최근 등록 서비스</h2>
            {recentServices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                등록된 서비스가 없습니다.
                <br />
                <Link
                  href="/marketplace/products/new"
                  className="text-purple-400 hover:text-purple-300 underline mt-2 inline-block"
                >
                  첫 서비스를 등록해보세요
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer"
                    onClick={() => router.push(`/marketplace/products/${service.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              statusLabels[service.status]?.color || 'bg-gray-500'
                            }`}
                          ></span>
                          <h3 className="font-semibold text-white text-sm">
                            {service.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-400">
                          {serviceTypeLabels[service.service_type] || service.service_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          ₩{service.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          조회 {service.view_count || 0} · 판매{' '}
                          {service.purchase_count || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Quotations */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">최근 견적 요청</h2>
            {recentQuotations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                받은 견적 요청이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm flex-1">
                        {quotation.title}
                      </h3>
                      {quotation.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                          대기중
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {quotation.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {quotation.user_profiles?.display_name || '익명'}
                      </span>
                      <span className="text-purple-400">{quotation.budget_range}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">빠른 작업</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              href="/marketplace/products/new"
              icon={<PlusIcon className="h-6 w-6" />}
              label="서비스 등록"
            />
            <QuickActionButton
              href="/dashboard/services"
              icon={<ShoppingBagIcon className="h-6 w-6" />}
              label="서비스 관리"
            />
            <QuickActionButton
              href="/dashboard/blog"
              icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
              label="블로그 관리"
            />
            <QuickActionButton
              href="/dashboard/portfolio"
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              label="포트폴리오 관리"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${color} mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-gray-300 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition group"
    >
      <div className="text-purple-400 group-hover:text-purple-300 mb-2">{icon}</div>
      <span className="text-sm text-gray-300 group-hover:text-white transition">
        {label}
      </span>
    </Link>
  );
}
