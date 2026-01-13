import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchGigById, clearCurrentGig } from "../store/slices/gigSlice";
import {
  submitBid,
  fetchBidsForGig,
  hireFreelancer,
  rejectBid,
  clearError,
} from "../store/slices/bidSlice";
import toast from "react-hot-toast";

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [bidData, setBidData] = useState({
    message: "",
    price: "",
  });
  const [showBidForm, setShowBidForm] = useState(false);

  const { currentGig, isLoading: gigLoading } = useSelector(
    (state) => state.gigs
  );
  const {
    bids,
    isLoading: bidLoading,
    error,
  } = useSelector((state) => state.bids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchGigById(id));
    }

    return () => {
      dispatch(clearCurrentGig());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (
      currentGig &&
      isAuthenticated &&
      user &&
      currentGig.ownerId._id === user.id
    ) {
      dispatch(fetchBidsForGig(id));
    }
  }, [currentGig, isAuthenticated, user, id, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to submit a bid");
      navigate("/login");
      return;
    }

    try {
      await dispatch(
        submitBid({
          gigId: id,
          message: bidData.message,
          price: parseFloat(bidData.price),
        })
      ).unwrap();

      toast.success("Bid submitted successfully!");
      setBidData({ message: "", price: "" });
      setShowBidForm(false);
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const handleHire = async (bidId) => {
    if (window.confirm("Are you sure you want to hire this freelancer?")) {
      try {
        await dispatch(hireFreelancer(bidId)).unwrap();
        toast.success("Freelancer hired successfully!");
        // Refresh gig data
        dispatch(fetchGigById(id));
      } catch (error) {
        // Error is handled by useEffect
      }
    }
  };

  const handleReject = async (bidId) => {
    if (window.confirm("Are you sure you want to reject this bid?")) {
      try {
        await dispatch(rejectBid(bidId)).unwrap();
        toast.success("Bid rejected successfully!");
        // Refresh bids data
        dispatch(fetchBidsForGig(id));
      } catch (error) {
        // Error is handled by useEffect
      }
    }
  };

  const isOwner = currentGig && user && currentGig.ownerId._id === user.id;
  const canBid =
    currentGig &&
    user &&
    currentGig.ownerId._id !== user.id &&
    currentGig.status === "open";

  if (gigLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gig not found</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Gig Details */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentGig.title}
            </h1>
            <p className="text-gray-600">Posted by {currentGig.ownerId.name}</p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentGig.status === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {currentGig.status}
            </span>
            <div className="text-3xl font-bold text-green-600 mt-2">
              ${currentGig.budget}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {currentGig.description}
          </p>
        </div>

        {/* Action Buttons */}
        {canBid && (
          <div className="border-t pt-6">
            {!showBidForm ? (
              <button
                onClick={() => setShowBidForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Submit a Bid
              </button>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Proposal
                  </label>
                  <textarea
                    value={bidData.message}
                    onChange={(e) =>
                      setBidData({ ...bidData, message: e.target.value })
                    }
                    required
                    rows={4}
                    placeholder="Explain why you're the best fit for this project..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Price ($)
                  </label>
                  <input
                    type="number"
                    value={bidData.price}
                    onChange={(e) =>
                      setBidData({ ...bidData, price: e.target.value })
                    }
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter your price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bidLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bidLoading ? "Submitting..." : "Submit Bid"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!isAuthenticated && currentGig.status === "open" && (
          <div className="border-t pt-6">
            <p className="text-gray-600 mb-4">
              Please login to submit a bid for this gig.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login to Bid
            </button>
          </div>
        )}
      </div>

      {/* Bids Section (Only for gig owner) */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">
            Received Bids ({bids.length})
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-600">No bids received yet.</p>
          ) : (
            <div className="space-y-6">
              {bids.map((bid) => (
                <div key={bid._id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {bid.freelancerId.name}
                      </h4>
                      <p className="text-gray-600">{bid.freelancerId.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
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

                  {bid.status === "pending" && currentGig.status === "open" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleHire(bid._id)}
                        disabled={bidLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bidLoading ? "Hiring..." : "Hire"}
                      </button>
                      <button
                        onClick={() => handleReject(bid._id)}
                        disabled={bidLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bidLoading ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetails;
