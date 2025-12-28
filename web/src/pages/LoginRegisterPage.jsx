import AuthModal from "../components/auth/AuthModal";

const LoginRegisterPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* Logo */}
      <img
        src="/assets/logo.png"
        alt="logo"
        className="absolute w-52 top-20 left-1/2 -translate-x-1/2 z-10"
      />

      {/* Decorative images */}
      <img
        src="/assets/bgr_login_1.png"
        alt=""
        className="absolute w-[450px] top-[210px] left-[110px] z-0"
      />
      <img
        src="/assets/bgr_login_2.png"
        alt=""
        className="absolute w-[450px] bottom-[150px] right-[130px] z-0"
      />

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default LoginRegisterPage;
