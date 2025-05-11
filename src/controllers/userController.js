
export const getProfile = (req, res) => res.json(req.user);

export const updateProfile = async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json(req.user);
};