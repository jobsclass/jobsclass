'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  TrashIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { JOBSCLASS_SERVICE_TYPES, calculatePlatformFee, calculatePartnerAmount } from '@/lib/constants/jobsclass';

interface CartItem {
  id: string;
  service_id: string;
  quantity: number;
  services: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    service_type: string;
    price: number;
    partner_id: string;
    partner_profiles?: {
      display_name: string;
    };
  };
}

export default function CartPage() {
  const router = useRouter();
  const supabase = createClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/cart');
        return;
      }

      const { data, error } = await supabase
        .from('carts')
        .select(`
          *,
          services!carts_service_id_fkey(
            id,
            title,
            slug,
            thumbnail_url,
            service_type,
            price,
            partner_id,
            partner_profiles!services_partner_id_fkey(
              display_name
            )
          )
        `)
        .eq('client_id', user.id);

      if (error) throw error;

      setCartItems(data || []);
      // Select all items by default
      setSelectedItems(new Set(data?.map((item) => item.id) || []));
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromCart(cartItemId: string) {
    try {
      const { error } = await supabase.from('carts').delete().eq('id', cartItemId);

      if (error) throw error;

      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      alert('장바구니에서 삭제하는데 실패했습니다.');
    }
  }

  function toggleSelectItem(itemId: string) {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  }

  function getSelectedTotal() {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.services.price, 0);
  }

  function getSelectedItems() {
    return cartItems.filter((item) => selectedItems.has(item.id));
  }

  async function proceedToCheckout() {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    // Create order with selected items
    const serviceIds = selected.map((item) => item.service_id);
    router.push(`/orders/new?services=${serviceIds.join(',')}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const selectedTotal = getSelectedTotal();
  const platformFee = calculatePlatformFee(selectedTotal);
  const partnerAmount = calculatePartnerAmount(selectedTotal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">장바구니</h1>
          </div>
          <Link
            href="/marketplace"
            className="text-purple-400 hover:text-purple-300 transition"
          >
            ← 계속 쇼핑하기
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">장바구니가 비어있습니다</h2>
            <p className="text-gray-400 mb-6">
              마켓플레이스에서 원하는 서비스를 찾아보세요
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
            >
              서비스 둘러보기
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                {/* Select All */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/20">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-white font-semibold">
                    전체 선택 ({selectedItems.size}/{cartItems.length})
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const typeInfo = JOBSCLASS_SERVICE_TYPES.find(
                      (t) => t.id === item.services.service_type
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                        />

                        {/* Thumbnail */}
                        <Link href={`/services/${item.services.slug}`} className="flex-shrink-0">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            {item.services.thumbnail_url ? (
                              <img
                                src={item.services.thumbnail_url}
                                alt={item.services.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">
                                {typeInfo?.icon}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1">
                          <Link href={`/services/${item.services.slug}`}>
                            <h3 className="text-white font-semibold hover:text-purple-300 transition mb-2">
                              {item.services.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span>{typeInfo?.icon}</span>
                            <span>{typeInfo?.name}</span>
                            <span>·</span>
                            <span>{item.services.partner_profiles?.display_name || '파트너'}</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            ₩{item.services.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
                <h2 className="text-xl font-bold text-white mb-6">주문 요약</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
                  <div className="flex justify-between text-gray-300">
                    <span>선택한 상품 ({selectedItems.size}개)</span>
                    <span>₩{selectedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>플랫폼 수수료 (10%)</span>
                    <span>₩{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>파트너 수령액 (90%)</span>
                    <span>₩{partnerAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-white mb-6">
                  <span>총 결제금액</span>
                  <span>₩{selectedTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={proceedToCheckout}
                  disabled={selectedItems.size === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  주문하기
                  <ArrowRightIcon className="h-5 w-5" />
                </button>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    💡 안전한 결제 시스템<br />
                    환불 보장 정책 적용<br />
                    24/7 고객 지원
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
