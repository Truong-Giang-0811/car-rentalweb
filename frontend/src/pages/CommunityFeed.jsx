import CustomerHeader from "../components/CustomerHeader";
import Footer from "../components/Footer";
import CommunityFeedContent from "../components/CommunityFeedContent";

function CommunityFeed() {
  return (
    <div className="community-page">
      <CustomerHeader />
      <CommunityFeedContent />
      <Footer />
    </div>
  );
}

export default CommunityFeed;