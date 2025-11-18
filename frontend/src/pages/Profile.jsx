import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../api";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/accounts/me/");
        setUser(res.data);
        setFirstName(res.data.first_name || "");
        setLastName(res.data.last_name || "");
        setEmail(res.data.email || "");
        setRole(res.data.role || "");
        setAvatarUrl(res.data.avatar_url || "");
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };
    fetchMe();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("first_name", firstName);
      form.append("last_name", lastName);
      if (avatarFile) form.append("avatar", avatarFile);
      const res = await api.patch("/api/accounts/me/", form);
      toast.success("Profile updated");
      // Cache-bust avatar to ensure browser refreshes the image
      if (res.data?.avatar_url) {
        setAvatarUrl(`${res.data.avatar_url}?t=${Date.now()}`);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      toast.error("Please choose an image first");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("avatar", avatarFile);
      const res = await api.patch("/api/accounts/me/", form);
      toast.success("Avatar updated");
      if (res.data?.avatar_url) {
        setAvatarUrl(`${res.data.avatar_url}?t=${Date.now()}`);
        setAvatarPreview("");
        setAvatarFile(null);
      }
    } catch (error) {
      toast.error("Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwOld || !pwNew || !pwConfirm) {
      toast.error("Please fill all password fields");
      return;
    }
    try {
      await api.post("/api/accounts/change-password/", {
        old_password: pwOld,
        new_password: pwNew,
        confirm_password: pwConfirm
      });
      toast.success("Password changed");
      setPwOld("");
      setPwNew("");
      setPwConfirm("");
    } catch (error) {
      const msg = error?.response?.data;
      if (msg?.old_password) toast.error("Incorrect current password");
      else if (msg?.confirm_password) toast.error("Passwords do not match");
      else toast.error("Failed to change password");
    }
  };

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen px-8 pb-16">
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-3xl font-bold text-cookie-darkbrown">My Profile</h1>
        <Link
          to={"/logout"}
          className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
        >
          Logout
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-cookie-lightcream rounded-md p-4 flex flex-col items-center gap-3">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-cookie-lightorange">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
          <div className="w-full max-w-xs flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAvatarFile(file);
                if (file) {
                  const url = URL.createObjectURL(file);
                  setAvatarPreview(url);
                } else {
                  setAvatarPreview("");
                }
              }}
              className="file-input file-input-bordered w-full"
            />
            <button
              onClick={handleSaveAvatar}
              disabled={loading || !avatarFile}
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            >
              {loading ? "Updating..." : "Update Avatar"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-cookie-lightcream rounded-md p-4">
          <h2 className="text-xl font-semibold text-cookie-darkbrown mb-4">Account Info</h2>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-cookie-darkbrown font-medium">First Name</label>
              <input
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-cookie-darkbrown font-medium">Last Name</label>
              <input
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-cookie-darkbrown font-medium">Email</label>
              <input
                disabled
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown opacity-70"
                value={email}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-cookie-darkbrown font-medium">Role</label>
              <input
                disabled
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown opacity-70 capitalize"
                value={role}
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-cookie-lightcream rounded-md p-4">
          <h2 className="text-xl font-semibold text-cookie-darkbrown mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-cookie-darkbrown font-medium">Current Password</label>
              <input
                type="password"
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                value={pwOld}
                onChange={(e) => setPwOld(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-cookie-darkbrown font-medium">New Password</label>
              <input
                type="password"
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-cookie-darkbrown font-medium">Confirm Password</label>
              <input
                type="password"
                className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;
