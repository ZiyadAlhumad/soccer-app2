import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
