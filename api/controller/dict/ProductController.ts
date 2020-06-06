import Controller from "../../tools/Controller";
import Product, {ProductDocument} from "../../models/Product";
import {GetMapping, Inject, PostMapping, PutMapping} from "../../desc";
import {Context} from "koa";
import {checkAuth} from "../../middleware/auth";


@GetMapping("products")
export class ProductController extends Controller<ProductDocument> {
  @Inject(Product)
  Model: any

  @Inject({disabled: 1, createdAt: -1,})
  defaultSort: any

  @PostMapping("", [checkAuth,])
  async create(ctx: Context): Promise<void> {
    await super.create(ctx);
  }

  @PutMapping(":id", [checkAuth,])
  async update(ctx: Context): Promise<void> {
    await super.update(ctx);
  }

  @GetMapping(":id")
  async show(ctx: Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping("")
  async index(ctx: Context): Promise<void> {
    await super.index(ctx);
  }
}