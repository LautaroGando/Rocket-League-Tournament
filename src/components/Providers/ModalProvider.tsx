"use client";

import { AnimatePresence } from "framer-motion";
import { useUiStore } from "@/stores/useUiStore";
import { CustomModal } from "@/components/ui/CustomModal";

export const ModalProvider = () => {
  const { modal } = useUiStore();

  return (
    <AnimatePresence>
      {modal && <CustomModal key={modal.title || "modal"} />}
    </AnimatePresence>
  );
};
