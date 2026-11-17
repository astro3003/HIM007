import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, MapPin, Truck, ShieldCheck, RefreshCw, Box, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  orderHistory: Order[];
  onSelectOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const STAGES: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    key: 'deployed',
    label: 'ORDER CONFIRMED',
    desc: 'Payment authenticated. Allocation registered in logistics queue.',
    icon: Box,
  },
  {
    key: 'inspected',
    label: 'QUALITY INSPECTED',
    desc: 'Clean batch testing & hermetic seal verification complete.',
    icon: ShieldCheck,
  },
  {
    key: 'transit',
    label: 'IN TRANSIT // PRIORITY AIR',
    desc: 'Moving via priority cold-chain air logistics corridor.',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'DELIVERED',
    desc: 'Direct doorstep handoff completed.',
    icon: CheckCircle,
  },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  orderHistory,
  onSelectOrder,
  onUpdateOrderStatus,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [countdownMinutes, setCountdownMinutes] = useState(882);

  useEffect(() => {
    if (activeOrder) {
      setSearchInput(activeOrder.orderId);
      setSearchError('');
    }
  }, [activeOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdownMinutes((prev) => Math.max(12, prev - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentOrder = activeOrder || (orderHistory.length > 0 ? orderHistory[0] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = orderHistory.find(
      (o) => o.orderId.toUpperCase() === query || o.trackingNumber.toUpperCase() === query
    );
    if (found) {
      onSelectOrder(found.orderId);
    } else {
      setSearchError(`No order record found for "${query}".`);
    }
  };

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'deployed':
        return 0;
      case 'inspected':
        return 1;
      case 'transit':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStageIndex = currentOrder ? getStageIndex(currentOrder.status) : 0;

  const handleAdvanceStage = () => {
    if (!currentOrder) return;
    const nextIdx = (currentStageIndex + 1) % 4;
    onUpdateOrderStatus(currentOrder.orderId, STAGES[nextIdx].key);
  };

  const hours = Math.floor(countdownMinutes / 60);
  const mins = countdownMinutes % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#14171F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto text-[#F6F4F0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#111319] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Truck className="w-4 h-4 text-[#FF4D00]" />
            <span className="font-editorial text-base font-bold text-white">
              Track Your HIM Order
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#1C202B] text-[#C8C4BC] hover:text-white transition-colors rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-[#14171F]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. #HIM-IN-8924X) or tracking number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#111319] border border-white/15 rounded-md px-4 py-2.5 text-xs text-white placeholder-[#C8C4BC]/60 focus:outline-none focus:border-[#FF4D00]"
              />
              <Search className="w-4 h-4 absolute right-3.5 top-2.5 text-[#C8C4BC]" />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shrink-0 cursor-pointer"
            >
              Track Order
            </button>
          </form>

          {searchError && (
            <div className="p-3 bg-[#FF4D00]/15 border border-[#FF4D00]/40 text-[#FF4D00] text-xs rounded-lg">
              {searchError}
            </div>
          )}

          {orderHistory.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto py-1 text-xs">
              <span className="text-[#C8C4BC] text-[11px] shrink-0 font-semibold">Your orders:</span>
              {orderHistory.map((o) => (
                <button
                  key={o.orderId}
                  type="button"
                  onClick={() => onSelectOrder(o.orderId)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors border cursor-pointer ${
                    currentOrder?.orderId === o.orderId
                      ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                      : 'bg-[#111319] text-[#C8C4BC] border-white/15 hover:text-white'
                  }`}
                >
                  {o.orderId}
                </button>
              ))}
            </div>
          )}

          {currentOrder ? (
            <div className="space-y-6">
              <div className="p-4 bg-[#111319] border border-white/10 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs tabular-nums">
                <div>
                  <div className="text-[#C8C4BC] text-[10px] font-mono uppercase">Order Reference</div>
                  <div className="text-[#FF4D00] font-bold text-sm mt-0.5">{currentOrder.orderId}</div>
                </div>
                <div>
                  <div className="text-[#C8C4BC] text-[10px] font-mono uppercase">Tracking Code</div>
                  <div className="text-white font-bold mt-0.5">{currentOrder.trackingNumber}</div>
                </div>
                <div>
                  <div className="text-[#C8C4BC] text-[10px] font-mono uppercase">Delivery Method</div>
                  <div className="text-white font-bold mt-0.5 truncate">{currentOrder.deliveryMethod}</div>
                </div>
                <div>
                  <div className="text-[#C8C4BC] text-[10px] font-mono uppercase">Estimated Arrival</div>
                  <div className="text-[#22C55E] font-bold mt-0.5">{hours}h {mins}m remaining</div>
                </div>
              </div>

              <div className="p-5 bg-[#111319] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-xs text-white font-mono font-bold uppercase tracking-wider">
                    Delivery Timeline
                  </div>
                  <button
                    type="button"
                    onClick={handleAdvanceStage}
                    className="px-3 py-1 bg-[#1C202B] hover:bg-[#FF4D00] border border-white/15 text-white text-[11px] font-semibold rounded-md flex items-center transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Advance Stage
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {STAGES.map((stage, idx) => {
                    const isPast = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const Icon = stage.icon;

                    return (
                      <div
                        key={stage.key}
                        className={`p-3.5 border rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-[#1C202B] border-[#FF4D00]'
                            : isPast
                            ? 'bg-[#14171F] border-[#22C55E]/50'
                            : 'bg-[#14171F]/60 border-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-md ${
                              isCurrent
                                ? 'bg-[#FF4D00] text-white'
                                : isPast
                                ? 'bg-[#22C55E] text-[#0B0D12]'
                                : 'bg-white/10 text-[#C8C4BC]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold">
                            {isPast ? (
                              <span className="text-[#22C55E]">Done</span>
                            ) : isCurrent ? (
                              <span className="text-[#FF4D00]">Active</span>
                            ) : (
                              <span className="text-[#C8C4BC]">Upcoming</span>
                            )}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white">{stage.label}</div>
                        <p className="mt-1 text-[11px] text-[#C8C4BC] leading-relaxed">{stage.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#111319] border border-white/10 rounded-xl">
                  <div className="text-[11px] font-mono font-bold text-[#FF4D00] uppercase mb-3 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#FF4D00]" />
                    Dispatch History
                  </div>
                  <div className="space-y-3">
                    {currentOrder.events.map((ev, i) => (
                      <div key={i} className="border-l-2 border-white/15 pl-3 relative">
                        <span
                          className={`w-2 h-2 rounded-full absolute -left-[5px] top-1 ${
                            ev.done || i <= currentStageIndex ? 'bg-[#FF4D00]' : 'bg-white/25'
                          }`}
                        />
                        <div className="text-[10px] text-[#C8C4BC]">{ev.timestamp} · {ev.location}</div>
                        <div className="text-white font-bold text-xs mt-0.5">{ev.title}</div>
                        <div className="text-[11px] text-[#C8C4BC] mt-0.5">{ev.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-[#FF4D00] uppercase mb-3">
                      Destination Address
                    </div>
                    <div className="space-y-1 text-[#C8C4BC]">
                      <div className="font-bold text-white">{currentOrder.customer.fullName}</div>
                      <div>{currentOrder.customer.address}</div>
                      <div>
                        {currentOrder.customer.city}, {currentOrder.customer.state}{' '}
                        {currentOrder.customer.postalCode}
                      </div>
                      <div>{currentOrder.customer.country}</div>
                      <div className="pt-1">Contact: {currentOrder.customer.email}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Package Items:</div>
                      <div className="space-y-1">
                        {currentOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-white font-medium">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="text-[#C8C4BC]">{item.product.volume}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs tabular-nums">
                    <span className="text-[#C8C4BC]">Total:</span>
                    <span className="text-[#FF4D00] font-bold text-sm">
                      {currentOrder.currency} {currentOrder.total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-white/15 rounded-xl space-y-3 bg-[#111319]">
              <AlertCircle className="w-10 h-10 mx-auto text-[#FF4D00]" />
              <h3 className="text-base font-editorial font-bold text-white">No Active Tracking Record</h3>
              <p className="text-xs text-[#C8C4BC] max-w-sm mx-auto">
                No orders have been dispatched yet. Place an order or enter an order reference code to track.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
