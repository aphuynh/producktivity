class InventoryItem:
    def __init__(self, id, store_item_id, name, cost, date_purchased, img_src, is_favorite):
        self.id = id
        self.store_item_id = store_item_id
        self.name = name
        self.cost = cost
        self.date_purchased = date_purchased
        self.img_src = img_src
        self.is_favorite = is_favorite
