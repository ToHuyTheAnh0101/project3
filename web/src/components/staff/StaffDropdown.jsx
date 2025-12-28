import { useState, useEffect } from "react";
import request from "../../api/httpClient";
import { useParams } from "react-router-dom";

const StaffDropdown = ({ initialSelectedIds = [], onChange }) => {
  const { organizationId } = useParams();
  const [allStaffs, setAllStaffs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await request("get", `/staffs?organizationId=${organizationId}`);
        setAllStaffs(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaffs();
  }, [organizationId]);

  const toggleStaff = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      if (onChange) onChange(Array.from(newSet));
      return newSet;
    });
  };

  useEffect(() => {
    setSelectedIds(new Set(initialSelectedIds));
  }, [initialSelectedIds]);

  const selectedStaffs = allStaffs.filter((s) => selectedIds.has(s._id));

  return (
    <div className="relative w-full">
      <button
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left text-sm font-medium hover:border-blue-500 transition-all"
        onClick={() => setOpen((o) => !o)}
      >
        Nhân viên ({selectedIds.size})
      </button>

      {selectedStaffs.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedStaffs.map((staff) => (
            <div
              key={staff._id}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 text-xs"
            >
              <img
                className="w-5 h-5 rounded-full object-cover"
                src={staff.avatarUrl || require("../../utils/utils").DEFAULT_AVATAR}
                alt={staff.authId.name}
              />
              <span className="text-gray-900">{staff.authId.name}</span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute top-full left-0 w-full max-h-52 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-md mt-2 p-2 z-10 flex flex-col gap-1">
          {allStaffs.map((staff) => (
            <label
              key={staff._id}
              className="flex items-center gap-2 p-1 rounded-md text-sm cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(staff._id)}
                onChange={() => toggleStaff(staff._id)}
                className="w-4 h-4 cursor-pointer"
              />
              <span>
                {staff.authId.name} ({staff.role})
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDropdown;
