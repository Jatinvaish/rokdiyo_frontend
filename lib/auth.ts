export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  
  // Clear cookie
  document.cookie = 'isAuthenticated=; path=/; max-age=0';
  
  // Redirect to sign in
  window.location.href = '/auth/sign-in';
};