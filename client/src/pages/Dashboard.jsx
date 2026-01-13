import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchGigs } from "../store/slices/gigSlice";
import {
  fetchMyBids,
  removeNotification,
  clearNotifications,
} from "../store/slices/bidSlice";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { gigs } = useSelector((state) => state.gigs);
  const { myBids, notifications } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchGigs());
    dispatch(fetchMyBids());
  }, [dispatch]);

  const myGigs = gigs.filter((gig) => gig.ownerId._id === user?.id);

  const handleRemoveNotification = (index) => {
    dispatch(removeNotification(index));
  };

  const handleClearAllNotifications = () => {
    dispatch(clearNotifications());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("my-gigs")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my-gigs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Gigs ({myGigs.length})
          </button>
          <button
            onClick={() => setActiveTab("my-bids")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my-bids"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Bids ({myBids.length})
          </button>
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Notifications</h2>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAllNotifications}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-600">No notifications yet.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`flex items-start justify-between p-4 rounded-lg ${
                    notification.type === "success"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div>
                    <p
                      className={`font-medium ${
                        notification.type === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        notification.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(index)}
                    className={`${
                      notification.type === "success"
                        ? "text-green-600 hover:text-green-800"
                        : "text-red-600 hover:text-red-800"
                    }`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Gigs Tab */}
      {activeTab === "my-gigs" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Posted Gigs</h2>
            <Link
              to="/create-gig"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Post New Gig
            </Link>
          </div>

          {myGigs.length === 0 ? (
            <p className="text-gray-600">You haven't posted any gigs yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myGigs.map((gig) => (
                <div key={gig._id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">{gig.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        gig.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {gig.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {gig.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">
                      ${gig.budget}
                    </span>
                    <Link
                      to={`/gig/${gig._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {activeTab === "my-bids" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">My Submitted Bids</h2>

          {myBids.length === 0 ? (
            <p className="text-gray-600">You haven't submitted any bids yet.</p>
          ) : (
            <div className="space-y-6">
              {myBids.map((bid) => (
                <div key={bid._id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {bid.gigId.title}
                      </h3>
                      <p className="text-gray-600">
                        Budget: ${bid.gigId.budget}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        ${bid.price}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bid.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : bid.status === "hired"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bid.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{bid.message}</p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/gig/${bid.gigId._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Gig
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
