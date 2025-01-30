module TradingPlatform::StockToken {
    use std::signer;

    struct Stock has key {
        symbol: vector<u8>,
        owner: address,
        quantity: u64,
    }

    public entry fun create_stock(owner: &signer, symbol: vector<u8>, quantity: u64) {
        let stock = Stock {
            symbol: symbol,
            owner: signer::address_of(owner),
            quantity: quantity,
        };
        move_to(owner, stock);
    }

    public entry fun transfer_stock(sender: &signer, receiver: address, symbol: vector<u8>, quantity: u64) {
        let sender_address = signer::address_of(sender);
        let stock = borrow_global_mut<Stock>(sender_address);
        assert!(stock.symbol == symbol, 100, b"Stock symbol mismatch");
        assert!(stock.quantity >= quantity, 101, b"Insufficient stock quantity");

        stock.quantity = stock.quantity - quantity;

        if (exists<Stock>(receiver)) {
            let receiver_stock = borrow_global_mut<Stock>(receiver);
            assert!(receiver_stock.symbol == symbol, 102, b"Receiver stock symbol mismatch");
            receiver_stock.quantity = receiver_stock.quantity + quantity;
        } else {
            let new_stock = Stock {
                symbol: symbol,
                owner: receiver,
                quantity: quantity,
            };
            move_to(&signer::borrow(receiver), new_stock);
        }
    }
}