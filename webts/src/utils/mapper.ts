
export const ContactReturnMapper = (contacts: any) => {
  return contacts.map((c: any) => {
      c.photoURL = c.photo_link;
      return c;
  })
};
