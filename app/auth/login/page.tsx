"use client";

import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

function FloatingInput({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  focused,
  children,
}: {
  id: string;
  name?: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  focused: boolean;
  children?: React.ReactNode;
}) {
  const floating = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder=""
        className={`
          w-full h-[45px] bg-white/[0.04] border border-white/[0.08]
          rounded-[10px] px-4 pt-[22px] pb-2 text-sm text-white outline-none
          transition-all duration-200
          focus:border-violet-500/60 focus:bg-violet-500/5
          ${children ? "pr-10" : ""}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 pointer-events-none transition-all duration-[180ms] ease-in-out
          ${
            floating
              ? "-top-2 text-[10.5px] bg-[#111118] text-violet-400 uppercase tracking-wide font-medium"
              : "top-1/2 -translate-y-1/2 text-sm text-white/35"
          }
        `}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleLogin = async () => {
  //   try {
  //     setLoading(true);

  //     await axios.post("/api/auth/login", {
  //       email: formData.email,
  //       password: formData.password,
  //     });

  //     router.push('/dashboard');
  //     toast.success("Login created 🎉");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Login failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials");
        return;
      }

      router.push(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
      toast.success("Login successful 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      {/* Card */}
      <div className="w-full max-w-[420px] bg-[#111118] border border-white/[0.07] rounded-[20px] px-8 shadow-[0_0_60px_rgba(99,91,255,0.08)]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center rounded-[14px]">
            <Image
              src="/devflow-logo.png"
              alt="DevFlow"
              width={150}
              height={150}
              className="mx-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
            />
          </div>
          <p className="text-[16px] text-white/40 mt-0.5">
            Create your account
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Email + Send OTP */}
          <div className="flex gap-2">
            <div className="flex-1">
              <FloatingInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                focused={focused === "email"}
              />
            </div>
          </div>

          {/* Password */}
          <FloatingInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            focused={focused === "password"}
          >
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </FloatingInput>
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-[50px] bg-linear-to-r from-violet-600 to-purple-500 text-white rounded-[10px] text-sm font-medium tracking-wide transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-default mb-4"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/[0.07]" />
          <span className="text-[12px] text-white/25 tracking-wide">
            or continue with
          </span>
          <div className="flex-1 h-px bg-white/[0.07]" />
        </div>

        {/* OAuth Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => signIn("google", { callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` })}
            className="flex-1 h-[46px] flex items-center justify-center gap-2 bg-white/4 border border-white/[0.08] rounded-[10px] text-[13px] text-white/70 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.15] hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="flex-shrink-0"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` })}
            className="flex-1 h-11.5 flex items-center justify-center gap-2 bg-white/4 border border-white/8 rounded-[10px] text-[13px] text-white/70 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/15 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="flex-shrink-0"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] text-white/35 mt-5">
          Create new account!{" "}
          <a
            href="/auth/signup"
            className="text-violet-400 font-medium hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
