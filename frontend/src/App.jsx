import  { useState } from 'react';
import axios from 'axios';

function EbookPage() {
    const [email, setEmail] = useState("");

    const handleBuyNow = async () => {
      try {
          const response = await axios.post('http://localhost:5000/api/checkout', { email });
          window.location.href = response.data.url;
      } catch (error) {
          console.error("Error initiating checkout:", error.response?.data || error.message);
          alert("Error initiating checkout");
      }
  };
  

    return (
        <div className="ebook-page">
            <h1>My eBook Title</h1>
            <img src="/ebook-cover.jpg" alt="eBook Cover" />
            <p>A short description of the eBook...</p>
            <h2>Price: $10</h2>

            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleBuyNow}>Buy Now</button>
        </div>
    );
}

export default EbookPage;
