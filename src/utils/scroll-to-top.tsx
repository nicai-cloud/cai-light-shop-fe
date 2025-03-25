import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A utility component that forces the page to scroll to the top between router transitions,
 * which is important on devices with smalls screens.
 *
 * @returns null
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
