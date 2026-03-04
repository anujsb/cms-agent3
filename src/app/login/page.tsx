// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     try {
//       const response = await fetch("/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, action: "login" }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Login failed");
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//       document.cookie = `token=${data.token}; path=/;`;
//       toast.success("Login successful");
//       router.push("/");
//     } catch (error) {
//       const errMsg = (error instanceof Error) ? error.message : "Login failed";
//       setError(errMsg);
//       toast.error(errMsg);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50 p-4 min-h-screen">
//       <Card className="shadow-lg py-4 w-full max-w-md">
//         <CardHeader className="flex flex-col items-center">
//           {/* Logo */}
//           {/* <img src="/logo.png" alt="Logo" className="mb-2 h-12" /> */}
//           <CardTitle className="font-bold text-2xl text-center">Welcome Back</CardTitle>
//           <p className="mt-1 text-gray-500 text-sm">Sign in to your account</p>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             {error && (
//               <div className="bg-red-100 px-3 py-2 rounded text-red-700 text-sm text-center">
//                 {error}
//               </div>
//             )}
//             <div className="relative">
//               <Input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="pl-10 w-full"
//                 autoFocus
//               />
//               <Mail className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" size={18} />
//             </div>
//             <div className="relative">
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="pr-10 pl-10 w-full"
//               />
//               <Lock className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" size={18} />
//               <button
//                 type="button"
//                 className="top-1/2 right-3 absolute text-gray-400 -translate-y-1/2 transform"
//                 onClick={() => setShowPassword((v) => !v)}
//                 tabIndex={-1}
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             <div className="flex justify-end">
//               <a href="#" className="text-blue-600 text-xs hover:underline">
//                 Forgot password?
//               </a>
//             </div>
//             <Button
//               type="submit"
//               className="bg-blue-600 hover:bg-blue-700 w-full"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <span className="flex justify-center items-center">
//                   <svg className="mr-2 w-5 h-5 text-white animate-spin" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                   </svg>
//                   Logging in...
//                 </span>
//               ) : (
//                 "Login"
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
