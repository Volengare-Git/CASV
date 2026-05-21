"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Send } from "lucide-react";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // TODO: wire up Resend email sending
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-gray-500">{t("subtitle")}</p>

      {sent ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl bg-green-50 p-10 text-center ring-1 ring-green-100">
          <CheckCircle className="h-10 w-10 text-green-500" />
          <h2 className="font-bold text-green-800">{t("success")}</h2>
          <p className="text-sm text-green-700">{t("successText")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("name")} *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")} *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interest">{t("interest")}</Label>
            <Select name="interest">
              <SelectTrigger>
                <SelectValue placeholder={t("selectInterest")} />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "committee",
                    "volunteer",
                    "construction",
                    "rental",
                    "ag",
                    "sponsor",
                    "website",
                    "other",
                  ] as const
                ).map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`interests.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">{t("message")} *</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Envoi..." : t("send")}
          </Button>
        </form>
      )}
    </div>
  );
}
