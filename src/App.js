import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './styles.css';
import useRazorpay from "react-razorpay";



const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const AdminPanel = ({ fetchFruits, fruits, cart, setCart }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [editFruit, setEditFruit] = useState(null);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const handleAdminLogin = () => {
    if (adminPassword === '123') {
      setAuthenticated(true);
      setInvalidPassword(false);
    } else {
      setInvalidPassword(true);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchFruits();
      fetchTransactions();
    }
  }, [authenticated, fetchFruits]);


  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/getTransactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
    }
  };

  const addFruit = async () => {
    try {
      await axios.post('http://localhost:5001/addFruit', fruitData);
      setFruitData({ name: '', image: '', quantity: 0, price: 0 });
      fetchFruits();
    } catch (error) {
      console.error('Error adding fruit:', error.message);
    }
  };

  const deleteFruit = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/deleteFruit/${id}`);
      fetchFruits();
    } catch (error) {
      console.error('Error deleting fruit:', error.message);
    }
  };

  const editExistingFruit = async () => {
    try {
      await axios.put(`http://localhost:5001/updateFruit/${editFruit._id}`, fruitData);
      setEditFruit(null);
      setFruitData({ name: '', image: '', quantity: 0, price: 0 });
      fetchFruits();
    } catch (error) {
      console.error('Error editing fruit:', error.message);
    }
  };

  const startEdit = (fruit) => {
    setEditFruit(fruit);
    setFruitData({
      name: fruit.name,
      image: fruit.image,
      quantity: fruit.quantity,
      price: fruit.price,
    });
  };

  const [fruitData, setFruitData] = useState({
    name: '',
    image: '',
    quantity: 0,
    price: 0,
  });

  return (
    <div>
      {!authenticated && (
        <div>
          <h2 className='middle middle-text'>Admin Login</h2>
          <p className='middle'>Password - 123</p>
          
          <div className="login-card-container">
          <img src="https://www.bluetissuemexico.com/img/inicia-sesion.gif" width="150px" alt="" className='centerbruh'></img>
          <input
          className="login-input" 
            type="password"
            placeholder="Enter admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button className="login-button"  onClick={handleAdminLogin}>Login</button>
          </div><div className="login-card-container1">
          {invalidPassword && <p style={{ color: 'red' }}>Invalid password. Access denied.</p>}</div>
        </div>
      )}

      {authenticated && (
        <div>
          <h1 className='middle middle-text'>Fruit Admin Panel</h1>
            

          <div className="container">
          <div className="form-container">

            
  <div>
    <label>Name:</label>
    <input type="text" value={fruitData.name} onChange={(e) => setFruitData({ ...fruitData, name: e.target.value })} />
  </div>
  <div>
    <label>Image URL:</label>
    <input type="text" value={fruitData.image} onChange={(e) => setFruitData({ ...fruitData, image: e.target.value })} />
  </div>
  <div>
    <label>Quantity:</label>  
    <input
      type="number"
      value={fruitData.quantity}
      onChange={(e) => setFruitData({ ...fruitData, quantity: e.target.value })}
    />
  </div>
  <div>
    <label>Price:</label>
    <input type="number" value={fruitData.price} onChange={(e) => setFruitData({ ...fruitData, price: e.target.value })} />
  </div>
  {editFruit ? (
    <button onClick={editExistingFruit}>Update Fruit</button>
  ) : (
    <button onClick={addFruit}>Add Fruit</button>
  )}
</div>

          <div className='card1'><ul className="transaction-info">
  {transactions.map((transaction) => (
    <li key={transaction._id}>
      <strong>Amount:</strong> {transaction.amount}{' '}
      <strong>Timestamp:</strong> {new Date(transaction.date).toLocaleString()}
    </li>
  ))}
</ul>
          <ul className="fruit-info">
            {fruits.map((fruit, index) => (
              <li className="item-container" key={fruit._id}>
                <strong>Name:</strong> {fruit.name}{' '}
                
                <img className="fruit-image" src={fruit.image} alt={fruit.name} style={{ maxWidth: '100px' }} />{' '}
                <strong>Quantity:</strong> {fruit.quantity},{' '}
                <strong>Price:</strong> {fruit.price}{' '}
                <button onClick={() => deleteFruit(fruit._id)}>Delete</button>{' '}
                <button onClick={() => startEdit(fruit)}>Edit</button>
              </li>
            ))}
          </ul></div>
        </div></div>
      )}
    </div>
  );
};

const UserViewWithCart = ({ fruits, cart, setCart, dispenseCart, goToHelloTab, goToMakePaymentTab, refreshUserView }) => {
  const addToCart = (fruit) => {
    const existingCartItem = cart.find((item) => item._id === fruit._id);

    if (fruit.quantity > 0 && (!existingCartItem || existingCartItem.quantity < fruit.quantity)) {
      setCart((prevCart) => {
        const updatedCart = existingCartItem
          ? prevCart.map((item) =>
              item._id === fruit._id ? { ...item, quantity: item.quantity + 1 } : item
            )
          : [...prevCart, { ...fruit, quantity: 1 }];

        return updatedCart;
      });
    } else {
      console.log('Cannot add to cart. Insufficient quantity or limit reached.');
    }
  };

  const removeFromCart = (index) => {
    const updatedCart = [...cart];

    // Remove one quantity of the item
    updatedCart[index].quantity--;

    // If the quantity becomes zero, remove the item from the cart
    if (updatedCart[index].quantity === 0) {
      updatedCart.splice(index, 1);
    }

    setCart(updatedCart);
  };

  useInterval(() => {
    refreshUserView();
  }, 1000);

  return (
    <div>
      <h2 className='middle-text middle'>Select your favourite juices</h2>
      <div className='container'>
        <ul className="fruit-info">
          {fruits.map((fruit) => (
            <li className="item-container" key={fruit._id}>
               {fruit.name}{' '}
              
              <img className="fruit-image" src={fruit.image} alt={fruit.name} />{' '}
              <strong >Quantity -</strong>
              <span className={`stock-pill ${fruit.quantity === 0 ? 'out-of-stock' : ''}`}>
                {fruit.quantity === 0 ? 'Out of Stock' : fruit.quantity}
              </span>{' '}
              <strong>&nbsp;Price -</strong>
              <span className="stock-pill">₹{fruit.price}</span>{' '}
              <button onClick={() => addToCart(fruit)} disabled={fruit.quantity === 0}>
                Add to Cart
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className='cartstyle'>
        {cart.length === 0 && <p>Please select some items.</p>}
        
        {cart.length > 0 && (
          <div>
            <h2 className='pill-box1'>Selected Items in Cart</h2>
            <ul className='pill-box'>
              {cart.map((cartItem, index) => (
                <li key={cartItem._id}>
                  {cartItem.name} - X{cartItem.quantity}{' '}
                  <button className="butt" onClick={() => removeFromCart(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {cart.length > 0 && (
        <div>
          <button className='fixed-button-payment' onClick={goToMakePaymentTab}>
            Go to Make Payment Tab
          </button>
        </div>
      )}
    </div>
  );
};

const ShoppingCart = ({ cart, goBackToChooseFruits, goToDispenseTab, dispenseCart }) => {
  const totalPrice = cart.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0);

  const [Razorpay] = useRazorpay();

  const handlePayment = async () => {
    const totalPrice = cart.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0);

    const options = {
      key: "rzp_test_gVzE8dbIWZOW2E",
      amount: totalPrice * 100, // Sample amount in paise
      currency: "INR",
      name: "Fruit Vending",
      description: "Test Transaction",
      prefill: {
        name: "sujit Bhogil",
        email: "proyou9999@example.com",
        contact: "8459580489",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
      handler: async function (response) {
        console.log("Payment success response:", response);
        
        // Store the transaction in the database
      try {
        await axios.post('http://localhost:5001/addTransaction', { amount: totalPrice });
      } catch (error) {
        console.error('Error storing transaction:', error.message);
      }

      // Call dispenseCart function here
      dispenseCart();
      goToDispenseTab();
      // You can perform additional actions here if needed
    },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
};



  return (
    <div>
      <h2 className='middle'>Make Payment</h2>

      {cart.length === 0 ? (
        <p className='middle middle-text'>Please select some items to make payment.</p>
      ) : (
        <div>
          <div className="cards">
          <p className='middle middle-text'>Awesome Choice, That'll be ₹{totalPrice}</p>
       
<article className="plan [ card ]">
  <div className="inner">
  <h2 className="title">Please check your items before paying..</h2>
          <ul className='contfix'>
            {cart.map((cartItem, index) => (
              <li className="libruh" key={cartItem._id}>
                 
                {cartItem.name} - X{cartItem.quantity} - ₹{cartItem.price * cartItem.quantity}
              </li>
              
            ))}
          </ul>

          <h2 className="title">Pay using your favourite UPI</h2>
    
    <ul className="features">
    <div className="box-container">
            <div className="rounded-box">
                <img className="scaleOnHover" src="https://static.vecteezy.com/system/resources/previews/017/110/060/original/latest-google-pay-icon-logo-free-vector.jpg" alt="" />
            </div>
            <div className="rounded-box">
            <img className="scaleOnHover" src="https://i.pinimg.com/736x/2a/cf/b6/2acfb6fb41f7fcb82c3230afdecff714.jpg" alt="" />
                
            </div>

            <div className="rounded-box">
            <img onClick={handlePayment} className="scaleOnHover" src="https://i.imgur.com/VB4fSpN.png" alt="" />
            </div>
            
        </div>
    
        
    </ul>
          </div>
          </article>
          </div>
          <button className='cartstyle' onClick={goBackToChooseFruits} style={{ marginTop: '10px' }}>
            Go Back to Choose Fruits
          </button>
        </div>
      )}
    </div>
  );
};

const DispenseTab = ({ cart }) => {
  const [dispensing, setDispensing] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      setDispensing(true);

      const dispenseTimer = setTimeout(() => {
        // Perform any necessary actions during dispense (if needed)

        // Set the dispense state back to false after 5 seconds
        setDispensing(false);
      }, 5000);

      return () => clearTimeout(dispenseTimer);
    }
  }, [cart]);

  return (
    <div>
      {dispensing && (
        <div>
          <img
            className="centered-text"
            src="https://cdna.artstation.com/p/assets/images/images/064/347/952/original/andra-pixel-vending-machine-artstation.gif?1687730818"
            alt=""
          />
          <p className="middle middle-text">Dispensing items, please wait 5 seconds...</p>
        </div>
      )}

      {!dispensing && cart.length === 0 && (
        <div>
          <p className="middle middle-text">Please select some items and come back.</p>
        </div>
      )}
    </div>
  );
};


const App = () => {
  const [fruits, setFruits] = useState([]);
  const [cart, setCart] = useState([]);
  
  

  useEffect(() => {
    fetchFruits();
  }, []);

  const fetchFruits = async () => {
    try {
      const response = await axios.get('http://localhost:5001/getFruits');
      setFruits(response.data);
    } catch (error) {
      console.error('Error fetching fruits:', error.message);
    }
  };

  const dispenseCart = async () => {
    try {
      for (const cartItem of cart) {
        const originalFruit = fruits.find((fruit) => fruit._id === cartItem._id);

        if (originalFruit) {
          const remainingQuantity = originalFruit.quantity - cartItem.quantity;

          const response = await axios.put(
            `http://localhost:5001/updateFruit/${cartItem._id}`,
            { quantity: remainingQuantity }
          );

          console.log(`Quantity updated for ${cartItem.name}: ${response.data.quantity}`);
        }
      }

      setCart([]);
    } catch (error) {
      console.error('Error updating quantity:', error.message);
    }
  };

  const goToHelloTab = () => {
    setActiveTab(1);
  };

  const goToMakePaymentTab = () => {
    setActiveTab(3);
  };

  const goToDispenseTab = () => {
    setActiveTab(4);
    setTimeout(() => {
      goToHelloTab();
    }, 5000);
  };
  const handleTabClick = (index) => {
    // Allow clicking on the "Get Started" (index 1) and "Admin Panel" (index 0) tabs
    if (index === 1 || index === 0) {
      setActiveTab(index);
    }
  };
  const [activeTab, setActiveTab] = useState(0);

  const refreshUserView = async () => {
    try {
      const response = await axios.get('http://localhost:5001/getFruits');
      setFruits(response.data);
    } catch (error) {
      console.error('Error fetching fruits:', error.message);
    }
  };

  return (
    <div>
      <Tabs selectedIndex={activeTab} onSelect={(index) => handleTabClick(index)} defaultIndex={1}>
        <TabList className="TabList">
          <Tab onSelect={() => handleTabClick(0)} className="Tab">Admin Panel 🍒</Tab>
          <Tab onSelect={() => handleTabClick(1)} className="Tab">Get Started ✨</Tab>
          <Tab onSelect={() => handleTabClick(2)} className="Tab">Choose Fruits 🤖</Tab>
          <Tab onSelect={() => handleTabClick(3)} className="Tab">Make Payment 💸</Tab>
          <Tab onSelect={() => handleTabClick(4)} className="Tab">Dispense 💎</Tab>
        </TabList>

       

        <TabPanel>
          <AdminPanel fetchFruits={fetchFruits} fruits={fruits} cart={cart} setCart={setCart} />
        </TabPanel>
        <TabPanel>
        <div>
          {/* <h1 class="middle">Welcome to our Fruit Vending Machine</h1>
          <p class="middle-text middle">What we have to offer </p>
         <div className="card-container">
            {Object.keys(inventory).map((item) => (
              <div key={item} className="card">
                <img src={getImageForItem(item)} alt={inventory[item].name} />
                <p>{inventory[item].name}</p>
                <p>${inventory[item].price.toFixed(2)}</p>
              </div>
            ))}
            </div> */}
            <div className="l-grid l-grid--half-half l-grid--gutter-large l-full-height">
  <div className="l-grid__item l-grid l-center-center theme-green first ms-center-content">
    <div className="content first ms-align-center">
      <h2 className="heading">Welcome to our Juice Vending Machine</h2>
      <p className="description1">Introducing our Fruit Juice Vending Machine: Fresh, hand-picked fruits at your fingertips. Enjoy a healthy drink anytime, anywhere.</p>
    </div>
  </div>
  <div className="l-grid__item l-grid l-center-center theme-white second ms-center-content">
    <div className="content ms-align-center">
      <h2 className="heading">Order Fruits Juice</h2>
      <p className="description">“Quick, convenient, and delicious fruit juices at your fingertips. Simply choose, enjoy, and go!”</p>
      

      <div className="link link--alt" onClick={() => setActiveTab(2)}>
  <svg viewBox='0 0 200 200' width='200' height='200' xmlns='http://www.w3.org/2000/svg' className="link__svg" aria-labelledby="link2-title link2-desc">
    <title id="link2-title">You are wonderful, now click this</title>
    <desc id="link2-desc">A rotating link with text placed around a circle, with a cloud/flower shape around it, and a smiley face inside</desc>

    <path id="link-circle-alt" className="link__path" d="M 35, 100 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0" stroke="none" fill="none" />

    <path className="link__cloud" d="M88.964,9.111C89.997,4.612 94.586,0.999 100,0.999C105.413,0.999 110.002,4.612 111.036,9.111C113.115,4.991 118.435,2.581 123.692,3.878C128.948,5.172 132.54,9.78 132.466,14.393C135.472,10.891 141.214,9.824 146.008,12.341C150.801,14.855 153.185,20.189 152.01,24.651C155.766,21.968 161.597,22.307 165.648,25.899C169.7,29.488 170.741,35.235 168.53,39.286C172.818,37.583 178.4,39.307 181.474,43.761C184.551,48.217 184.183,54.047 181.068,57.451C185.641,56.823 190.646,59.834 192.567,64.894C194.486,69.955 192.735,75.529 188.895,78.09C193.486,78.573 197.626,82.693 198.278,88.067C198.93,93.441 195.898,98.433 191.556,100C195.898,101.567 198.93,106.56 198.278,111.934C197.626,117.307 193.486,121.427 188.895,121.91C192.735,124.472 194.486,130.045 192.567,135.106C190.646,140.167 185.641,143.177 181.068,142.549C184.183,145.954 184.551,151.783 181.474,156.239C178.4,160.693 172.818,162.418 168.53,160.712C170.741,164.766 169.7,170.512 165.648,174.102C161.597,177.691 155.766,178.032 152.01,175.349C153.185,179.812 150.801,185.145 146.008,187.66C141.214,190.176 135.472,189.109 132.466,185.607C132.54,190.221 128.948,194.828 123.692,196.123C118.435,197.419 113.115,195.009 111.036,190.889C110.002,195.388 105.413,199.001 100,199.001C94.586,199.001 89.997,195.388 88.964,190.889C86.884,195.009 81.564,197.419 76.307,196.123C71.051,194.828 67.461,190.221 67.533,185.607C64.529,189.109 58.785,190.176 53.992,187.66C49.2,185.145 46.815,179.812 47.989,175.349C44.233,178.032 38.402,177.691 34.351,174.102C30.299,170.512 29.259,164.766 31.469,160.712C27.181,162.418 21.599,160.693 18.525,156.239C15.449,151.783 15.816,145.954 18.931,142.549C14.359,143.177 9.353,140.167 7.434,135.106C5.513,130.045 7.264,124.472 11.104,121.91C6.514,121.427 2.374,117.307 1.722,111.934C1.07,106.56 4.103,101.567 8.443,100C4.103,98.433 1.07,93.441 1.722,88.067C2.374,82.693 6.514,78.573 11.104,78.09C7.264,75.529 5.513,69.955 7.434,64.894C9.353,59.834 14.359,56.823 18.931,57.451C15.816,54.047 15.449,48.217 18.525,43.761C21.599,39.307 27.181,37.583 31.469,39.286C29.259,35.235 30.299,29.488 34.351,25.899C38.402,22.307 44.233,21.968 47.989,24.651C46.815,20.189 49.2,14.855 53.992,12.341C58.785,9.824 64.529,10.891 67.533,14.393C67.461,9.78 71.051,5.172 76.307,3.878C81.564,2.581 86.884,4.991 88.964,9.111Z" fill="none" />

    <g className="link__face">
      <path d='M 95 102 Q 100 107 105 102' fill="none" />
      <ellipse className='' cx='90' cy='100' rx='2' ry='2' stroke="none" />
      <ellipse className='' cx='110' cy='100' rx='2' ry='2' stroke="none" />
      <ellipse className='' cx='100' cy='100' rx='35' ry='35' fill="none" />
    </g>

    <text className="link__text">
      <textPath href="#link-circle-alt" stroke="none">
        • Order HERE • Order Here • Order Here •
      </textPath>
    </text>
  </svg>
</div>

    </div>
  </div>
</div>

         
        </div>
      </TabPanel>
        <TabPanel>
          <UserViewWithCart
            fruits={fruits}
            cart={cart}
            setCart={setCart}
            dispenseCart={dispenseCart}
            goToHelloTab={goToHelloTab}
            goToMakePaymentTab={goToMakePaymentTab}
            refreshUserView={refreshUserView}
          />
        </TabPanel>

        <TabPanel>
  <ShoppingCart cart={cart} goBackToChooseFruits={() => setActiveTab(2)} dispenseCart={dispenseCart} goToDispenseTab={goToDispenseTab} /> 
</TabPanel>

        <TabPanel>
          <DispenseTab cart={cart} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default App;
