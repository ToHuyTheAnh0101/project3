import { useState, useEffect, useRef } from "react";
import request from "../../api/httpClient";

const ResourceEditor = ({ initialResources = [], onChange }) => {
  const [allResources, setAllResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await request("get", "/resources");
        setAllResources(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const mapped = allResources.map((r) => {
      const existing = initialResources.find((ir) => ir.resourceId === r._id);
      return {
        resourceId: r._id,
        name: r.name,
        quantity: existing ? existing.quantity : 0,
      };
    });
    setResources(mapped);
  }, [initialResources, allResources]);

  const changeQuantity = (id, delta) => {
    setResources((prev) => {
      const newRes = prev.map((r) =>
        r.resourceId === id
          ? { ...r, quantity: Math.max(0, r.quantity + delta) }
          : r
      );
      onChange?.(newRes.filter((r) => r.quantity > 0));
      return newRes;
    });
  };

  const handleInputChange = (id, val) => {
    setResources((prev) => {
      const newRes = prev.map((r) =>
        r.resourceId === id ? { ...r, quantity: Math.max(0, val) } : r
      );
      onChange?.(newRes.filter((r) => r.quantity > 0));
      return newRes;
    });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left text-sm font-medium bg-white hover:border-blue-500"
        onClick={() => setOpen((o) => !o)}
      >
        Tài nguyên ({resources.filter((r) => r.quantity > 0).length})
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 w-full max-h-64 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-md mt-2 p-2 z-20 flex flex-col gap-2">
          {resources.map((r) => (
            <div
              key={r.resourceId}
              className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-100"
            >
              <span className="text-sm">{r.name}</span>
              <div className="flex items-center gap-2">
                <button
                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200"
                  onClick={() => changeQuantity(r.resourceId, -1)}
                >
                  -
                </button>
                <input
                  type="text"
                  className="w-16 text-center border border-gray-300 rounded py-0.5 text-sm"
                  value={r.quantity === 0 ? "" : r.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleInputChange(r.resourceId, isNaN(val) ? 0 : val);
                  }}
                />
                <button
                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200"
                  onClick={() => changeQuantity(r.resourceId, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Resources */}
      <div className="mt-2 flex flex-wrap gap-2">
        {resources
          .filter((r) => r.quantity > 0)
          .map((r) => (
            <div
              key={r.resourceId}
              className="px-2 py-1 rounded-full bg-gray-100 text-sm"
            >
              {r.name} ({r.quantity})
            </div>
          ))}
      </div>
    </div>
  );
};

export default ResourceEditor;
