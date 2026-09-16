// Shape of a single Employment Details record.
export function emptyEmployment(cardNo = "") {
  return {
    id: Date.now().toString(),

    cardNo,
    workingPlace: "",

    name: "",
    address: "",
    ageDob: "",
    fatherHusbandName: "",
    education: "",
    maritalStatus: "",

    // Family details table (matches a/b/c/d rows in the printed form)
    family: [
      { label: "a) Father Name", name: "", age: "" },
      { label: "b) Mother Name", name: "", age: "" },
      { label: "c) Spouse Name", name: "", age: "" },
    ],
    children: [], // each item: { name: "", age: "" } — add/remove dynamically

    nominee: "",
    mobile: "",
    aadhaar: "",

    // Base64 data-url of the passport photo, set from the phone camera / gallery
    photo: "",
    signature: "",
    // ---- Office Use Only ----
    dateOfJoining: "",
    designation: "",
    wages: "",
    esicRegNo: "",
    epfAcNo: "",
    bankDetails: "",
    dateOfLeaving: "",
    reasonForLeaving: "",
    remarks: "",
  };
}
