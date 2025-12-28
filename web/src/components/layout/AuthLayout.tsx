import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <div>{children}</div>
    </>
  );
};

export default AuthLayout;
