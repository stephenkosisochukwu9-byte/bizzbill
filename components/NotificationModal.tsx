"use client";

import { Check, X } from "lucide-react";

type NotificationType = "success" | "error";

type NotificationModalProps = {
  open: boolean;
  type?: NotificationType;
  title: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
};

export default function NotificationModal({
  open,
  type = "success",
  title,
  message,
  buttonText = "Continue",
  onClose,
}: NotificationModalProps) {
  if (!open) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="notification-modal w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
        {/* ICON */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="success-circle flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg">
                <Check
                  size={32}
                  strokeWidth={3}
                  className="check-icon text-white"
                />
              </div>
            </div>
          ) : (
            <div className="error-circle flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg">
                <X
                  size={32}
                  strokeWidth={3}
                  className="text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* TITLE */}
        <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-gray-950">
          {title}
        </h2>

        {/* MESSAGE */}
        {message && (
          <p className="mt-3 text-sm font-medium leading-6 text-gray-600">
            {message}
          </p>
        )}

        {/* BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className={`mt-7 w-full rounded-xl px-5 py-3.5 text-base font-extrabold text-white shadow-sm transition active:scale-[0.98] ${
            isSuccess
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {buttonText}
        </button>
      </div>

      <style jsx global>{`
        .notification-modal {
          animation: notificationModalIn 0.3s ease-out forwards;
        }

        .success-circle {
          animation: successCircleIn 0.5s ease-out forwards;
        }

        .check-icon {
          animation: checkIconIn 0.4s ease-out 0.15s forwards;
          opacity: 0;
        }

        .error-circle {
          animation: successCircleIn 0.5s ease-out forwards;
        }

        @keyframes notificationModalIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }

          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes successCircleIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }

          60% {
            opacity: 1;
            transform: scale(1.1);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes checkIconIn {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-20deg);
          }

          70% {
            opacity: 1;
            transform: scale(1.15) rotate(5deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
