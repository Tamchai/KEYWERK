import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "../../api/address";
import { createOrder, getOrder, listAdminOrders, listOrders, updateOrderAddress, updateOrderStatus, updateTracking } from "../../api/order";
import { createPayment, listAdminPayments, verifyPayment } from "../../api/payment";
import { getProfile, updateProfile, uploadProfileImage } from "../../api/profile";
import type { AddressPayload, CreateOrderPayload, OrderStatus } from "../../api/types";

export const commerceKeys = {
  addresses: ["commerce", "addresses"] as const,
  orders: ["commerce", "orders"] as const,
  order: (id: string) => ["commerce", "order", id] as const,
  adminOrders: ["commerce", "admin", "orders"] as const,
  adminPayments: ["commerce", "admin", "payments"] as const,
  profile: ["commerce", "profile"] as const,
};

export function useProfileQuery() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: commerceKeys.profile });

  return {
    profileQuery: useQuery({ queryKey: commerceKeys.profile, queryFn: getProfile }),
    saveProfile: useMutation({ mutationFn: updateProfile, onSuccess: invalidate }),
    saveProfileImage: useMutation({ mutationFn: uploadProfileImage, onSuccess: invalidate }),
  };
}

export function useAddressesQuery() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: commerceKeys.addresses });

  return {
    addressesQuery: useQuery({ queryKey: commerceKeys.addresses, queryFn: listAddresses }),
    saveAddress: useMutation({
      mutationFn: ({ id, payload }: { id?: string; payload: AddressPayload }) =>
        id ? updateAddress(id, payload) : createAddress(payload),
      onSuccess: invalidate,
    }),
    deleteAddress: useMutation({ mutationFn: deleteAddress, onSuccess: invalidate }),
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commerceKeys.orders }),
  });
}

export function useOrdersQuery() {
  return useQuery({ queryKey: commerceKeys.orders, queryFn: listOrders });
}

export function useOrderQuery(orderId: string, pollPayment = false) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: commerceKeys.order(orderId) });

  return {
    orderQuery: useQuery({
      queryKey: commerceKeys.order(orderId),
      queryFn: () => getOrder(orderId),
      enabled: Boolean(orderId),
      refetchInterval: (query) => pollPayment && (!query.state.data?.payment || query.state.data.payment.status === "pending") ? 2000 : false,
    }),
    submitPayment: useMutation({
      mutationFn: () => createPayment(orderId),
      onSuccess: invalidate,
    }),
    updateAddress: useMutation({
      mutationFn: (payload: AddressPayload) => updateOrderAddress(orderId, payload),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminOrdersQuery() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: commerceKeys.adminOrders });
    queryClient.invalidateQueries({ queryKey: ["commerce", "order"] });
  };

  return {
    ordersQuery: useQuery({ queryKey: commerceKeys.adminOrders, queryFn: listAdminOrders }),
    changeStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
      onSuccess: invalidate,
    }),
    saveTracking: useMutation({
      mutationFn: ({ id, trackingNumber }: { id: string; trackingNumber: string }) =>
        updateTracking(id, trackingNumber),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminPaymentsQuery() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: commerceKeys.adminPayments });
    queryClient.invalidateQueries({ queryKey: commerceKeys.adminOrders });
    queryClient.invalidateQueries({ queryKey: ["commerce", "order"] });
  };

  return {
    paymentsQuery: useQuery({ queryKey: commerceKeys.adminPayments, queryFn: listAdminPayments }),
    verifyPayment: useMutation({
      mutationFn: ({ id, status }: { id: string; status: "paid" | "failed" }) => verifyPayment(id, status),
      onSuccess: invalidate,
    }),
  };
}
