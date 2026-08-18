"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import images from "~/assets/images";
import { showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { DeleteRequest } from "~/utils/new-request";

interface ConfirmationModalProps {
  onCancel: () => void;
  skill: any;
}

const DeleteSkillsModal: React.FC<ConfirmationModalProps> = ({
  onCancel,
  skill,
}) => {
  const params = useParams();
  const id = params.id as string;
  const [deleteloading, setDeleteloading] = useState(false);
  const { state, dispatch } = useContext(DataContext);

  const deleteSkill = async () => {
    setDeleteloading(true);

    const res = await DeleteRequest(`/skills/${skill.skill_id}/agents/${id}`);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.SKILLS_CALLBACK,
        payload: !state?.skillsCallback,
      });
      showSuccess(res?.data?.message);
    }
    onCancel();
    setDeleteloading(false);
  };

  //

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="z-10 max-w-xl bg-white rounded-xl shadow-xl ">
        {/* Title */}
        <div className="flex items-start justify-between p-4">
          <h2 className="text-xl font-semibold">Delete Skill</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition border py-1 px-2 rounded"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <hr />

        {/* Content */}
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-800 p-4 border-2 rounded-lg mx-6 mb-4">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-sm bg-[#F1F1FE] border`}
          >
            <Image
              src={skill.avatar || images.bot}
              alt="skill"
              width={20}
              height={20}
              unoptimized
            />
          </div>

          <div>
            <h4 className="font-semibold text-base">{skill.name}</h4>
            <p>{skill.description}</p>
          </div>
        </div>

        <p className="mb-4 px-6">
          Are you sure you want to delete this Skill? {state.colleague?.name}{" "}
          would no longer be able to perform tasks that need this Skill.
        </p>

        <p className="mt-4 text-sm border-t pt-4 px-6">
          <strong>Note:</strong> Note: You could always add this skill later
        </p>

        <div className="mt-6 flex justify-end gap-3 px-4 pb-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No, Cancel
          </button>

          <button
            onClick={deleteSkill}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            {deleteloading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Deleting</span>
                <Loading width="20" height="20" />
              </span>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSkillsModal;
