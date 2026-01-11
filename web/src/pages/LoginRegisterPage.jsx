import AuthModal from "../components/auth/AuthModal";

const LoginRegisterPage = () => {
  return (
    <div className="relative min-h-screen bg-[#f0f2f5] flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Hệ thống quản lý sự kiện Evora
        </h1>
        <AuthModal />
      </div>
    </div>
  );
};

export default LoginRegisterPage;
