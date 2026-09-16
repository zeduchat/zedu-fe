type DeactivationEntity = {
  is_deactivated?: boolean | string;
  sender_is_deactivated?: boolean | string;
  is_restricted?: boolean | string;
  sender_is_restricted?: boolean | string;
  user?: DeactivationEntity;
  participant?: DeactivationEntity;
  participants?: DeactivationEntity[];
} | null;

const isTrue = (value: unknown) => value === true || value === "true";

const ownDeactivated = (entity?: DeactivationEntity): boolean => {
  if (!entity || typeof entity !== "object") return false;
  return isTrue(entity.is_deactivated) || isTrue(entity.sender_is_deactivated);
};

const ownRestricted = (entity?: DeactivationEntity): boolean => {
  if (!entity || typeof entity !== "object") return false;
  return isTrue(entity.is_restricted) || isTrue(entity.sender_is_restricted);
};

const relatedPeople = (entity?: DeactivationEntity): DeactivationEntity[] => {
  if (!entity || typeof entity !== "object") return [];

  const people: DeactivationEntity[] = [];
  if (entity.user) people.push(entity.user);
  if (entity.participant) people.push(entity.participant);

  const participants = Array.isArray(entity.participants)
    ? entity.participants
    : [];
  if (participants.length > 0 && participants.length <= 2) {
    people.push(...participants);
  }

  return people;
};

export const isUserDeactivated = (entity?: DeactivationEntity): boolean => {
  if (!entity || typeof entity !== "object") return false;
  if (ownDeactivated(entity)) return true;
  return relatedPeople(entity).some(ownDeactivated);
};

export const isUserRestricted = (entity?: DeactivationEntity): boolean => {
  if (!entity || typeof entity !== "object") return false;
  if (isUserDeactivated(entity)) return false;
  if (ownRestricted(entity)) return true;
  return relatedPeople(entity).some(
    (person) => ownRestricted(person) && !ownDeactivated(person)
  );
};

export type DeactivationLabel = "Deactivated" | "Restricted";

export const getDeactivationLabel = (
  entity?: DeactivationEntity
): DeactivationLabel | null => {
  if (isUserDeactivated(entity)) return "Deactivated";
  if (isUserRestricted(entity)) return "Restricted";
  return null;
};

export const DEACTIVATED_AVATAR_SRC = "/images/user.png";
