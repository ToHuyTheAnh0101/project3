import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import request from "../../api/httpClient";

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendVerification = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    try {
      await request("post", "/auth/send-verification", { email });
      setIsCodeSent(true);
      toast.success("Mã xác nhận đã được gửi! Kiểm tra gmail của bạn.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gửi mã xác nhận thất bại!"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await request("post", "/auth/login", { email, password });
        localStorage.setItem("access_token", res.data.access_token);
        toast.success("Đăng nhập thành công!");
        setTimeout(() => navigate("/organization"), 800);
      } else {
        await request("post", "/auth/register", { 
          email, 
          name, 
          password, 
          verificationCode 
        });
        toast.success("Đăng ký thành công!");
        setTimeout(() => {
          setIsLogin(true);
          setVerificationCode("");
          setIsCodeSent(false);
        }, 800);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đăng nhập / đăng ký thất bại!"
      );
    }
  };

  return (
    <div className="flex justify-center items-center bg-[#f0f2f5]">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[350px] text-center">
        <h2 className="text-2xl font-semibold mb-5">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col mb-4 text-left">
            <label className="mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="p-3 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Name (only when register) */}
          {!isLogin && (
            <div className="flex flex-col mb-4 text-left">
              <label className="mb-1 font-medium">Tên đăng nhập</label>
              <input
                type="text"
                placeholder="Nhập tên của bạn"
                className="p-3 border border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col mb-4 text-left">
            <label className="mb-1 font-medium">Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              className="p-3 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Verification Code (only when register) */}
          {!isLogin && (
            <div className="flex flex-col mb-4 text-left">
              <label className="mb-1 font-medium">Mã xác nhận</label>
              <input
                type="text"
                placeholder="Nhập mã xác nhận 6 số"
                className="p-3 border border-gray-300 rounded-md"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
          )}

          {/* Button Group */}
          {!isLogin ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSendVerification}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isCodeSent}
              >
                {isCodeSent ? "Mã đã được gửi" : "Gửi mã xác nhận"}
              </button>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Đăng ký
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Đăng nhập
            </button>
          )}
        </form>

        {/* Toggle */}
        <p className="mt-4 text-sm text-gray-600">
          {isLogin ? (
            <>
              Bạn chưa có tài khoản?{" "}
              <span
                className="text-indigo-600 font-medium cursor-pointer underline"
                onClick={() => {
                  setIsLogin(false);
                  setVerificationCode("");
                  setIsCodeSent(false);
                }}
              >
                Đăng ký
              </span>
            </>
          ) : (
            <>
              Bạn đã có tài khoản?{" "}
              <span
                className="text-indigo-600 font-medium cursor-pointer underline"
                onClick={() => {
                  setIsLogin(true);
                  setVerificationCode("");
                  setIsCodeSent(false);
                }}
              >
                Đăng nhập
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
