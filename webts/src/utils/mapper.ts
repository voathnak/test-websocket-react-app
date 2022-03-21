
export const ContactReturnMapper = (contacts: any) => {
  return contacts.map((c: any) => {
      c.photoURL = c.photo_link;
      c.onlineStatus = !!c.onlineStatus;
      return c;
  })
};
