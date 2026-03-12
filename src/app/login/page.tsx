import { redirect } from "next/navigation";

// 暂时跳过登录，直接重定向到主页（方便前端开发）
export default async function LoginPage() {
  redirect("/");
}
