"use client";
import AllPeopleHeader from "../../_components/people-nav/all-peoples";
import PeopleTab from "../../_components/channels/tabs/peoples-tab";

export default function PeoplesPage() {
  //

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <AllPeopleHeader />

      <PeopleTab />
    </div>
  );
}
