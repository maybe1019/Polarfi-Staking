import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React from "react";

type Props = {
  onUnlock: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ForceUnlockConfirmModal = ({ onUnlock, open, setOpen }: Props) => {
  return (
    <Modal
      isOpen={open}
      onOpenChange={(o) => {
        setOpen(o);
      }}
    >
      <ModalContent>
        <ModalHeader>Confirm Unlock</ModalHeader>
        <ModalBody>
          <div>
            Do you want to proceed force unlock? <br /> You will lose 60% of
            your locked amount.
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-4">
            <Button onClick={() => setOpen(false)} color="secondary">
              Close
            </Button>
            <Button onClick={onUnlock} color="danger">
              Unlock
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ForceUnlockConfirmModal;
