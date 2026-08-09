import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services/addressService';
import { useAuthStore } from '@/store/authStore';
import { CreateAddressPayload, SavedAddress, UpdateAddressPayload } from '@/types/address';

export function useAddressMutations() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isAuthenticated = !!(user?.id && tokens?.accessToken);

  const queryKey = isAuthenticated ? ['customer', 'addresses', user.id] : ['customer', 'addresses', 'guest'];

  // CREATE ADDRESS
  const createAddressMutation = useMutation({
    mutationFn: async (payload: CreateAddressPayload) => {
      if (!isAuthenticated) {
        const newAddr: SavedAddress = {
          id: `addr_${Date.now()}`,
          label: payload.label || 'Home',
          completeAddress: payload.completeAddress,
          landmark: payload.landmark,
          city: payload.city || 'Ahmedabad',
          state: payload.state || 'Gujarat',
          postalCode: payload.postalCode,
          isDefault: payload.isDefault ?? false,
        };
        return newAddr;
      }
      const res = await addressService.createAddress(payload);
      if (!res.ok || !res.data) throw res;
      return res.data;
    },
    onSuccess: (newAddr) => {
      queryClient.setQueryData<SavedAddress[]>(queryKey, (old = []) => {
        // Filter out existing address matching the same tag/label (tag replacement!)
        const filteredOld = old.filter((a) => a.label.toLowerCase() !== newAddr.label.toLowerCase());
        const updated = newAddr.isDefault
          ? filteredOld.map((a) => ({ ...a, isDefault: false }))
          : filteredOld;
        return [...updated, newAddr];
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // UPDATE ADDRESS
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAddressPayload }) => {
      if (!isAuthenticated) {
        const oldList = queryClient.getQueryData<SavedAddress[]>(queryKey) || [];
        const existing = oldList.find((a) => a.id === id);
        if (!existing) throw new Error('Address not found');
        return {
          ...existing,
          ...payload,
          label: payload.label || existing.label,
          completeAddress: payload.completeAddress || existing.completeAddress,
          isDefault: payload.isDefault ?? existing.isDefault,
        } as SavedAddress;
      }
      const res = await addressService.updateAddress(id, payload);
      if (!res.ok || !res.data) throw res;
      return res.data;
    },
    onSuccess: (updatedAddr) => {
      queryClient.setQueryData<SavedAddress[]>(queryKey, (old = []) => {
        return old.map((addr) => {
          if (addr.id === updatedAddr.id) return updatedAddr;
          if (updatedAddr.isDefault) return { ...addr, isDefault: false };
          return addr;
        });
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // DELETE ADDRESS
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthenticated) return { id, success: true };
      const res = await addressService.deleteAddress(id);
      if (!res.ok) throw res;
      return { id, success: true };
    },
    onSuccess: ({ id }) => {
      queryClient.setQueryData<SavedAddress[]>(queryKey, (old = []) => {
        return old.filter((a) => a.id !== id);
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // SET DEFAULT ADDRESS
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthenticated) return id;
      const res = await addressService.setDefaultAddress(id);
      if (!res.ok) throw res;
      return id;
    },
    onSuccess: (defaultId) => {
      queryClient.setQueryData<SavedAddress[]>(queryKey, (old = []) => {
        return old.map((a) => ({
          ...a,
          isDefault: a.id === defaultId,
        }));
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    createAddress: createAddressMutation,
    updateAddress: updateAddressMutation,
    deleteAddress: deleteAddressMutation,
    setDefaultAddress: setDefaultAddressMutation,
  };
}
