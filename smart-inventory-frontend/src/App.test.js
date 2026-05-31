import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
import React from 'react';
// Import file đăng nhập cơ khí vừa tạo ở bước trên
import ModernSecureLogin from './components/ModernSecureLogin';

function App() {
  return (
      <>
        {/* Gọi component hiển thị ra màn hình */}
        <ModernSecureLogin />
      </>
  );
}

export default App;