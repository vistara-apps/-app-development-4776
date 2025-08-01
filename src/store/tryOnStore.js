import { create } from 'zustand'

const useTryOnStore = create((set) => ({
  selectedProduct: null,
  userPhoto: null,
  virtualResult: null,
  isGenerating: false,
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setUserPhoto: (photo) => set({ userPhoto: photo }),
  setVirtualResult: (result) => set({ virtualResult: result }),
  setIsGenerating: (isGenerating) => set({ isGenerating })
}))

export default useTryOnStore