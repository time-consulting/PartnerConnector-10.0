// Temporary no-op implementation to avoid React hook violations
// This prevents any React hooks from being called while we debug the issue

function toast({ ...props }: any) {
  // Log to console instead of showing toast (for debugging)
  console.log('Toast (disabled):', props.title || props.description || props);
  
  return {
    id: Math.random().toString(36),
    dismiss: () => {},
    update: () => {},
  }
}

function useToast() {
  // No React hooks used here - just return the same interface
  return {
    toasts: [],
    toast,
    dismiss: () => {},
  }
}

export { useToast, toast }